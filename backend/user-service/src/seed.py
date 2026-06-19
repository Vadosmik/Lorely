from sqlmodel import select
from core.db import async_session
from core.security import get_password_hash
from src.models.users import User, Role

async def create_initial_admin():
    async with async_session() as session:
        # 1. Upewnij się, że rola 'admin' istnieje
        result = await session.execute(select(Role).where(Role.title == "admin"))
        admin_role = result.scalar_one_or_none()
        if not admin_role:
            admin_role = Role(title="admin")
            session.add(admin_role)
            await session.commit()
            await session.refresh(admin_role)

        # 2. Upewnij się, że użytkownik 'vadosmik' istnieje
        result = await session.execute(select(User).where(User.username == "vadosmik"))
        admin_user = result.scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                username="vadosmik",
                email="vadosmik@example.com",
                hashed_password=get_password_hash("admin123"), # Hasło tymczasowe
                is_active=True
            )
            # Przypisz rolę bezpośrednio
            admin_user.roles.append(admin_role)
            session.add(admin_user)
            await session.commit()
            print("--- KONTO ADMINA 'vadosmik' ZOSTAŁO UTWORZONE ---")
