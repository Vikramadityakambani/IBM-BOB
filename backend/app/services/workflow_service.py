import json
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.content import ContentItem, WorkflowEvent, AuditEvent, Comment
from ..schemas.auth import UserSession

class WorkflowService:
    @staticmethod
    def transition_content(
        db: Session,
        content_id: str,
        action: str,
        user: UserSession,
        feedback: str = None,
        scheduled_at: str = None
    ) -> ContentItem:
        item = db.query(ContentItem).filter(
            ContentItem.id == content_id,
            ContentItem.workspace_id == user.workspace_id
        ).first()

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item not found in current workspace"
            )

        current_status = item.status
        target_status = current_status

        if action == "submit_review":
            if current_status not in ["draft", "rejected"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot submit content in '{current_status}' status for review."
                )
            target_status = "in_review"

        elif action == "approve":
            # Strict Separation of Duties check
            if user.role == "creator":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Separation of Duties violation: Creators cannot self-approve content. A Reviewer or Admin must approve."
                )
            if current_status != "in_review":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only content in 'In Review' status can be approved."
                )
            target_status = "approved"

        elif action == "request_changes":
            if user.role == "creator":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only Reviewers or Admins can request changes."
                )
            if current_status != "in_review":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Can only request revisions on items currently in review."
                )
            if not feedback or not feedback.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Reviewer feedback is mandatory when requesting revisions."
                )
            target_status = "draft"

            # Automatically add comment with the reviewer feedback
            comment = Comment(
                workspace_id=user.workspace_id,
                content_id=item.id,
                author_id=user.id,
                author_name=user.display_name,
                author_role=user.role,
                body=feedback.strip()
            )
            db.add(comment)

        elif action == "reject":
            if user.role == "creator":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only Reviewers or Admins can reject content."
                )
            if current_status != "in_review":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Can only reject items currently in review."
                )
            target_status = "rejected"

        elif action == "schedule":
            if user.role == "creator":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only Reviewers or Admins can assign a publishing schedule."
                )
            if current_status != "approved":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Content must be Approved before it can be scheduled for publication."
                )
            if not scheduled_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A valid scheduled publishing timestamp is required."
                )
            target_status = "scheduled"
            item.scheduled_at = scheduled_at

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown workflow action: '{action}'."
            )

        # Update item status
        item.status = target_status
        item.updated_at = datetime.now(timezone.utc)

        # Create immutable workflow event
        event = WorkflowEvent(
            workspace_id=user.workspace_id,
            content_id=item.id,
            actor_id=user.id,
            actor_name=user.display_name,
            actor_role=user.role,
            from_status=current_status,
            to_status=target_status,
            feedback=feedback
        )
        db.add(event)

        # Create immutable audit record
        audit = AuditEvent(
            workspace_id=user.workspace_id,
            actor_id=user.id,
            action=f"WORKFLOW_{action.upper()}",
            resource_type="content_item",
            resource_id=item.id,
            details=json.dumps({
                "from_status": current_status,
                "to_status": target_status,
                "actor_role": user.role,
                "feedback": feedback,
                "scheduled_at": scheduled_at
            })
        )
        db.add(audit)
        db.commit()
        db.refresh(item)
        return item
