class Oracle:
    """Transparent, offline analytical agent for the simulated ecosystem."""

    def analyze(self, world):
        population = len(world.creatures)
        food = len(world.food)
        energy_values = [c.energy for c in world.creatures]
        avg_energy = sum(energy_values) / len(energy_values) if energy_values else 0

        history = list(world.population_history)
        if len(history) >= 8:
            older = sum(history[-8:-4]) / 4
            recent = sum(history[-4:]) / 4
            change = ((recent - older) / max(1, older)) * 100
        else:
            change = 0

        signals = []
        if population < 8:
            status = "CRITICAL"
            signals.append("Population is dangerously small.")
        elif population < 18:
            status = "STRESSED"
            signals.append("Population has a limited survival buffer.")
        else:
            status = "STABLE"
            signals.append("Population is currently large enough to persist.")

        if food < max(12, population // 2):
            status = "CRITICAL" if population < 18 else "STRESSED"
            signals.append("Food supply is low relative to population.")
        else:
            signals.append("Food supply is not currently the strongest constraint.")

        if energy_values and avg_energy < 35:
            status = "CRITICAL" if population < 18 else "STRESSED"
            signals.append("Average creature energy is low.")
        if change < -15:
            signals.append(f"Recent population trend is declining ({change:.0f}%).")
        elif change > 15:
            signals.append(f"Recent population trend is growing ({change:.0f}%).")
        else:
            signals.append("Recent population trend is relatively steady.")

        if status == "CRITICAL":
            recommendation = "Trigger a food boom, then observe whether the population stabilizes."
        elif status == "STRESSED":
            recommendation = "Reduce environmental pressure and compare the next 30–60 seconds."
        else:
            recommendation = "Try a drought or meteor event and measure the recovery time."

        return (
            f"ORACLE STATUS: {status}\n"
            f"Population: {population} | Food: {food} | Avg. energy: {avg_energy:.1f}\n"
            + "\n".join(f"• {s}" for s in signals)
            + f"\n\nEXPERIMENT: {recommendation}"
        )
