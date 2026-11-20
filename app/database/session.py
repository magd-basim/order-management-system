from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
engine = create_engine(
    settings.DATABASE_URL,  
    echo=settings.DEBUG,
    pool_pre_ping=True
# عندما يتصل تطبيقك بقاعدة البيانات عبر SQLAlchemy، فإنه لا يقوم بفتح وإغلاق اتصال جديد مع كل طلب (Request)، بل يحتفظ بمجموعة من الاتصالات المفتوحة مسبقاً جاهزة للاستخدام تسمى Connection Pool.
)
sessionlocal= sessionmaker(
    bind=engine,
# عند كتابة bind=engine، أنت تقوم بربط هذه الـ Session بالـ engine.
   autoflush= False
)