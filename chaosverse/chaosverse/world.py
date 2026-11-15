import math
import random
from collections import deque
from dataclasses import dataclass
import pygame
from .config import WORLD_WIDTH, WORLD_HEIGHT, INITIAL_CREATURES, INITIAL_FOOD, MAX_FOOD, HISTORY_LENGTH
from .oracle import Oracle

@dataclass
class Creature:
    x: float
    y: float
    energy: float
    speed: float
    preferred_temp: float
    age: float = 0.0
    hue: int = 145

@dataclass
class Food:
    x: float
    y: float
    nutrition: float = 30.0

class World:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.creatures = []
        self.food = []
        self.temperature = 0.5
        self.food_rate = 1.0
        self.mutation = 0.08
        self.tick = 0
        self.events = deque(maxlen=7)
        self.population_history = deque(maxlen=HISTORY_LENGTH)
        self.food_history = deque(maxlen=HISTORY_LENGTH)
        self.oracle = Oracle()
        self._spawn_initial()

    def _spawn_initial(self):
        for _ in range(INITIAL_CREATURES):
            self.creatures.append(self._new_creature())
        for _ in range(INITIAL_FOOD):
            self.food.append(self._new_food())
        self._record()

    def _new_creature(self, x=None, y=None, energy=75, speed=None, preferred_temp=None, hue=None):
        return Creature(
            x if x is not None else self.rng.uniform(18, WORLD_WIDTH - 18),
            y if y is not None else self.rng.uniform(18, WORLD_HEIGHT - 18),
            energy,
            speed if speed is not None else self.rng.uniform(32, 65),
            preferred_temp if preferred_temp is not None else self.rng.random(),
            hue if hue is not None else self.rng.randint(95, 175),
        )

    def _new_food(self):
        return Food(self.rng.uniform(8, WORLD_WIDTH - 8), self.rng.uniform(8, WORLD_HEIGHT - 8))

    def _record(self):
        self.population_history.append(len(self.creatures))
        self.food_history.append(len(self.food))

    def update(self, dt):
        self.tick += 1
        for creature in list(self.creatures):
            creature.age += dt
            if not self.food:
                target = None
            else:
                target = min(self.food, key=lambda f: (f.x-creature.x)**2 + (f.y-creature.y)**2)
            if target:
                dx, dy = target.x - creature.x, target.y - creature.y
                distance = math.hypot(dx, dy)
                if distance > 1:
                    step = min(distance, creature.speed * dt)
                    creature.x += dx / distance * step
                    creature.y += dy / distance * step
                if distance < 10:
                    creature.energy = min(125, creature.energy + target.nutrition)
                    if target in self.food:
                        self.food.remove(target)

            temperature_penalty = abs(self.temperature - creature.preferred_temp) * 0.10
            creature.energy -= dt * (2.1 + creature.speed * 0.012 + temperature_penalty)
            creature.x = max(5, min(WORLD_WIDTH - 5, creature.x))
            creature.y = max(5, min(WORLD_HEIGHT - 5, creature.y))

            if creature.energy > 108 and len(self.creatures) < 180 and self.rng.random() < 0.012:
                child_speed = max(25, creature.speed + self.rng.uniform(-1, 1) * self.mutation * 20)
                child_temp = min(1, max(0, creature.preferred_temp + self.rng.uniform(-1, 1) * self.mutation))
                creature.energy -= 38
                self.creatures.append(self._new_creature(
                    creature.x + self.rng.uniform(-12, 12),
                    creature.y + self.rng.uniform(-12, 12),
                    energy=48, speed=child_speed, preferred_temp=child_temp,
                    hue=max(70, min(190, creature.hue + self.rng.randint(-8, 8)))
                ))

            if creature.energy <= 0 or creature.age > 95:
                if creature in self.creatures:
                    self.creatures.remove(creature)

        spawn_probability = 0.10 * self.food_rate
        if len(self.food) < MAX_FOOD and self.rng.random() < spawn_probability:
            self.food.append(self._new_food())

        if self.tick % 12 == 0:
            self._record()

    def drop_food(self, x, y):
        """Add a small food drop at a location chosen by the player."""
        if len(self.food) < MAX_FOOD:
            self.food.append(Food(
                max(8, min(WORLD_WIDTH - 8, float(x))),
                max(8, min(WORLD_HEIGHT - 8, float(y))),
            ))
            self.events.appendleft("PLAYER: food dropped into the habitat")

    def food_boom(self):
        for _ in range(65):
            if len(self.food) < MAX_FOOD:
                self.food.append(self._new_food())
        self.events.appendleft("FOOD BOOM: resources increased")

    def drought(self):
        self.food = self.food[:max(4, len(self.food)//3)]
        self.food_rate = 0.35
        self.events.appendleft("DROUGHT: food regeneration reduced")

    def meteor_strike(self):
        if self.creatures:
            casualties = max(1, len(self.creatures)//4)
            self.rng.shuffle(self.creatures)
            self.creatures = self.creatures[casualties:]
        self.events.appendleft("METEOR: population impact")

    def handle_click(self, pos):
        x, y = pos
        panel_x = WORLD_WIDTH
        if x < panel_x:
            return None
        local_x = x - panel_x
        if 18 <= local_x <= 145 and 555 <= y <= 594:
            return "pause"
        if 155 <= local_x <= 300 and 555 <= y <= 594:
            return "reset"
        if 18 <= local_x <= 145 and 605 <= y <= 644:
            return "food"
        if 155 <= local_x <= 300 and 605 <= y <= 644:
            return "drought"
        if 18 <= local_x <= 145 and 655 <= y <= 694:
            return "meteor"
        if 155 <= local_x <= 300 and 655 <= y <= 694:
            return "oracle"
        return None
