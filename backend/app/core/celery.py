from celery import Celery
from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "nexopeak",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.services.etl_service",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Optional: Configure periodic tasks
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Add periodic tasks here
    # Example: sender.add_periodic_task(
    #     crontab(hour=2, minute=0),  # Daily at 2 AM UTC
    #     etl_daily_data.s(),
    #     name='daily-etl'
    # )
    pass
