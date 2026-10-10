from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from ..core.config import settings
from ..models.base import Base

# Engine configuration: SQLite needs check_same_thread=False
connect_args = {}
if "sqlite" in settings.active_database_url:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.active_database_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from ..models import User, Workspace, Membership, BrandProfile, Campaign, ContentItem, Comment, WorkflowEvent, AuditEvent
    Base.metadata.create_all(bind=engine)
    from .seed import seed_default_data
    db = SessionLocal()
    try:
        seed_default_data(db)
    finally:
        db.close()
