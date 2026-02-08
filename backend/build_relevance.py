#!/usr/bin/env python3
"""
Build document-stock relevance mappings using Claude API.
Second-pass analysis to link documents to stocks with causal chains.
"""

import asyncio
import argparse

from app.database import async_session
from app.news_scraper import build_relevance_mappings


VALID_ROUNDS = ["ai_boom_2023", "banking_crisis_2023", "inflation_regime_2022"]


async def main():
    parser = argparse.ArgumentParser(description="Build document-stock relevance mappings")
    parser.add_argument(
        "--round",
        type=str,
        required=True,
        choices=VALID_ROUNDS + ["all"],
        help="Round ID to process, or 'all' for all rounds"
    )

    args = parser.parse_args()

    print("="*80)
    print("RELEVANCE MAPPING BUILDER")
    print("="*80)
    print()

    rounds_to_process = VALID_ROUNDS if args.round == "all" else [args.round]

    total_links = 0

    for round_id in rounds_to_process:
        print(f"\n{'='*80}")
        print(f"ROUND: {round_id}")
        print(f"{'='*80}")

        async with async_session() as session:
            link_count = await build_relevance_mappings(
                db=session,
                round_id=round_id
            )
            total_links += link_count

        print(f"✓ {link_count} relevance links created for {round_id}")

    print()
    print("="*80)
    print(f"✓ COMPLETE: {total_links} total relevance links created")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
