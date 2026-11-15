from chaosverse.world import World

def test_oracle_returns_explanation_and_status():
    world = World(seed=5)
    report = world.oracle.analyze(world)
    assert "ORACLE STATUS:" in report
    assert "EXPERIMENT:" in report

def test_oracle_handles_empty_population():
    world = World(seed=6)
    world.creatures.clear()
    report = world.oracle.analyze(world)
    assert "CRITICAL" in report
