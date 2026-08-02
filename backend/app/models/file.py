import uuid
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project


class GeneratedFile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "generated_files"

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    path: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(50), default="typescript", nullable=False)
    agent_type: Mapped[str] = mapped_column(String(50), default="backend_dev", nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project")
