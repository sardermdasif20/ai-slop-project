from chaosverse.world import World

def test_world_starts_with_creatures_and_food():
    world = World(seed=1)
    assert len(world.creatures) > 0
    assert len(world.food) > 0

def test_food_boom_increases_food():
    world = World(seed=2)
    before = len(world.food)
    world.food_boom()
    assert len(world.food) > before

def test_drought_reduces_food():
    world = World(seed=3)
    before = len(world.food)
    world.drought()
    assert len(world.food) < before

def test_update_advances_tick():
    world = World(seed=4)
    before = world.tick
    world.update(0.1)
    assert world.tick == before + 1
