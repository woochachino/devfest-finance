#!/usr/bin/env python3
"""
Initialize round configurations in the database.
Creates ONLY the 3 RoundConfig records (no stocks/documents).
"""

import asyncio
from datetime import date

from app.database import async_session, engine, Base
from app.models import RoundConfig


async def main():
    print("="*80)
    print("ROUND INITIALIZATION")
    print("="*80)
    print()

    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Tables created")

    async with async_session() as session:
        rounds = [
            RoundConfig(
                id="ai_boom_2023",
                title="The AI Boom Divergence",
                period_start=date(2023, 1, 1),
                period_end=date(2023, 6, 30),
                description=(
                    "ChatGPT has just launched, sparking an AI frenzy. "
                    "Some tech stocks are soaring while others lag behind. "
                    "Can you identify which companies will capture the AI wave?"
                ),
                difficulty="medium",
                display_order=1,
            ),
            RoundConfig(
                id="banking_crisis_2023",
                title="Banking Crisis & Flight to Safety",
                period_start=date(2023, 1, 1),
                period_end=date(2023, 6, 30),
                description=(
                    "Regional banks are collapsing. Silicon Valley Bank fails. "
                    "Investors are fleeing to safety. Where do you put your money "
                    "when the financial system shows cracks?"
                ),
                difficulty="hard",
                display_order=2,
            ),
            RoundConfig(
                id="inflation_regime_2022",
                title="Inflation Regime Change",
                period_start=date(2022, 1, 1),
                period_end=date(2022, 12, 31),
                description=(
                    "Inflation hits 40-year highs. The Fed pivots hawkish. "
                    "Russia invades Ukraine. Energy prices explode. "
                    "Which sectors thrive in this new regime?"
                ),
                difficulty="medium",
                display_order=3,
            ),
        ]

        for round_config in rounds:
            # Check if already exists
            from sqlalchemy import select
            result = await session.execute(
                select(RoundConfig).where(RoundConfig.id == round_config.id)
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  Round '{round_config.id}' already exists, skipping")
            else:
                session.add(round_config)
                print(f"  ✓ Created round: {round_config.title}")

        await session.commit()

    print()
    print("="*80)
    print("✓ COMPLETE: 3 rounds initialized")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
