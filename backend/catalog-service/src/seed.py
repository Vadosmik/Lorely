from sqlmodel import select
from core.db import async_session
from src.models.story import Genre, Category

async def create_initial_genre():
    # 1. Definiujemy listę standardowych gatunków testowych
    default_genres = [
        {
            "slug": "fantasy",
            "en": "Fantasy",
            "ru": "Фэнтези",
            "pl": "Fantasy",
            "by": "Фэнтэзі"
        },
        {
            "slug": "sci-fi",
            "en": "Sci-Fi",
            "ru": "Научная фантастика",
            "pl": "Sci-Fi",
            "by": "Навуковая фантастыка"
        },
        {
            "slug": "horror",
            "en": "Horror",
            "ru": "Ужасы",
            "pl": "Horror",
            "by": "Жахі"
        }
    ]

    default_categories = [
        {
            "slug": "romance",
            "en": "Romance",
            "ru": "Романтика",
            "pl": "Romans",
            "by": "Рамантыка"
        },
        {
            "slug": "adventure",
            "en": "Adventure",
            "ru": "Приключения",
            "pl": "Przygoda",
            "by": "Прыгоды"
        },
        {
            "slug": "detective",
            "en": "Detective",
            "ru": "Детектив",
            "pl": "Detektywistyczne",
            "by": "Дэтэктыў"
        }
    ]

    async with async_session() as session:
        for genre_data in default_genres:
            statement = select(Genre).where(Genre.slug == genre_data["slug"])
            result = await session.execute(statement)
            existing_genre = result.scalars().first()

            if not existing_genre:
                new_genre = Genre(**genre_data)
                session.add(new_genre)
                print(f"--- GATUNEK '{genre_data['en']}' ZOSTAŁ DODANY ---")

        for category_data in default_categories:
            statement = select(Category).where(Category.slug == category_data["slug"])
            result = await session.execute(statement)
            existing_category = result.scalars().first()

            if not existing_category:
                new_category = Category(**category_data)
                session.add(new_category)
                print(f"--- KATEGORIA '{category_data['en']}' ZOSTAŁA DODANA ---")
        
        await session.commit()