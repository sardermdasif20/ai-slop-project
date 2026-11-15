import math
import pygame
from .config import SCREEN_WIDTH, SCREEN_HEIGHT, WORLD_WIDTH, PANEL_WIDTH

# A compact game HUD: high contrast, readable cards, and clear controls.
BG = (8, 13, 24)
PANEL = (15, 23, 38)
CARD = (23, 34, 52)
CARD_EDGE = (39, 56, 78)
TEXT = (232, 240, 250)
MUTED = (139, 157, 181)
MINT = (93, 230, 183)
GOLD = (255, 194, 105)
CORAL = (255, 116, 132)
BLUE = (116, 183, 255)


def _text(surface, font, value, x, y, color=TEXT):
    surface.blit(font.render(str(value), True, color), (x, y))


def _card(surface, rect, fill=CARD, border=CARD_EDGE, radius=12):
    pygame.draw.rect(surface, fill, rect, border_radius=radius)
    pygame.draw.rect(surface, border, rect, width=1, border_radius=radius)


def _button(surface, font, label, rect, color, active=False):
    r = pygame.Rect(rect)
    pygame.draw.rect(surface, color, r, border_radius=9)
    if active:
        pygame.draw.rect(surface, (245, 250, 255), r, width=2, border_radius=9)
    rendered = font.render(label, True, (10, 17, 28))
    surface.blit(rendered, rendered.get_rect(center=r.center))


def _bar(surface, x, y, width, height, value, maximum, color):
    pygame.draw.rect(surface, (39, 52, 70), (x, y, width, height), border_radius=height // 2)
    ratio = max(0.0, min(1.0, value / max(1, maximum)))
    if ratio:
        pygame.draw.rect(surface, color, (x, y, max(3, int(width * ratio)), height), border_radius=height // 2)


def _chart(surface, values, rect, color, maximum=None):
    x, y, w, h = rect
    pygame.draw.rect(surface, (17, 27, 43), rect, border_radius=7)
    if len(values) < 2:
        return
    max_v = max(1, maximum or max(values))
    points = []
    for i, value in enumerate(values):
        px = x + 5 + int(i * (w - 10) / (len(values) - 1))
        py = y + h - 5 - int((value / max_v) * (h - 10))
        points.append((px, py))
    pygame.draw.lines(surface, color, False, points, 2)
    pygame.draw.circle(surface, color, points[-1], 3)


def _draw_world(surface, world, small_font):
    # Subtle grid and soft habitat zones.
    surface.fill((9, 17, 29), (0, 0, WORLD_WIDTH, SCREEN_HEIGHT))
    for x in range(0, WORLD_WIDTH, 40):
        pygame.draw.line(surface, (17, 29, 44), (x, 0), (x, SCREEN_HEIGHT))
    for y in range(0, SCREEN_HEIGHT, 40):
        pygame.draw.line(surface, (17, 29, 44), (0, y), (WORLD_WIDTH, y))

    # Food gets a soft halo so it is easy to spot.
    for food in world.food:
        p = (int(food.x), int(food.y))
        pygame.draw.circle(surface, (24, 75, 58), p, 7)
        pygame.draw.circle(surface, (112, 240, 151), p, 3)

    # Draw simple little organisms with eyes and a subtle energy ring.
    for c in world.creatures:
        p = (int(c.x), int(c.y))
        hue = max(80, min(205, int(c.hue)))
        body = (hue // 2, min(235, 130 + hue // 3), 220)
        radius = 4 + min(3, int(c.energy / 42))
        pygame.draw.circle(surface, (24, 48, 66), p, radius + 3)
        pygame.draw.circle(surface, body, p, radius)
        pygame.draw.circle(surface, (239, 250, 255), (p[0] + 1, p[1] - 1), 1)
        if c.energy < 28:
            pygame.draw.circle(surface, CORAL, p, radius + 2, 1)


def draw_app(screen, world, paused, speed, oracle_message):
    screen.fill(BG)
    title = pygame.font.SysFont("segoeui", 25, bold=True)
    heading = pygame.font.SysFont("segoeui", 16, bold=True)
    body = pygame.font.SysFont("segoeui", 14)
    small = pygame.font.SysFont("segoeui", 12)
    tiny = pygame.font.SysFont("segoeui", 11)

    _draw_world(screen, world, small)
    # World title strip.
    pygame.draw.rect(screen, (11, 20, 33), (0, 0, WORLD_WIDTH, 48))
    _text(screen, heading, "THE LIVING WORLD", 20, 13, MINT)
    _text(screen, small, f"DAY {world.tick // 600 + 1:03d}   •   {len(world.creatures)} ORGANISMS", 225, 16, MUTED)
    state = "PAUSED" if paused else "LIVE SIMULATION"
    pygame.draw.rect(screen, (43, 58, 78), (WORLD_WIDTH - 158, 11, 138, 26), border_radius=13)
    _text(screen, tiny, state, WORLD_WIDTH - 145, 18, GOLD if paused else MINT)

    # Side dashboard.
    pygame.draw.rect(screen, PANEL, (WORLD_WIDTH, 0, PANEL_WIDTH, SCREEN_HEIGHT))
    pygame.draw.line(screen, CARD_EDGE, (WORLD_WIDTH, 0), (WORLD_WIDTH, SCREEN_HEIGHT), 2)
    x = WORLD_WIDTH + 17
    _text(screen, title, "CHAOSVERSE", x, 14, MINT)
    _text(screen, tiny, "ARTIFICIAL LIFE SIMULATOR  /  HUMAN × AI", x + 2, 45, MUTED)

    # Metric cards.
    metrics = [("POPULATION", len(world.creatures), MINT), ("FOOD", len(world.food), (125, 230, 145)), ("SIM TICK", world.tick, BLUE)]
    for i, (label, value, color) in enumerate(metrics):
        bx = x + i * 98
        _card(screen, (bx, 72, 91, 66))
        _text(screen, tiny, label, bx + 9, 82, MUTED)
        _text(screen, heading, f"{value:>4}", bx + 9, 103, color)

    avg = sum(c.energy for c in world.creatures) / max(1, len(world.creatures))
    _card(screen, (x, 148, 292, 51))
    _text(screen, small, "AVERAGE ENERGY", x + 11, 157, MUTED)
    _text(screen, heading, f"{avg:.1f}%", x + 11, 175, TEXT)
    _bar(screen, x + 125, 172, 151, 10, avg, 125, MINT)

    # Analytics cards.
    _card(screen, (x, 208, 292, 104))
    _text(screen, heading, "POPULATION TREND", x + 11, 216, MINT)
    _chart(screen, list(world.population_history), (x + 10, 241, 272, 60), MINT)
    _card(screen, (x, 320, 292, 91))
    _text(screen, heading, "FOOD RESERVES", x + 11, 328, (125, 230, 145))
    _chart(screen, list(world.food_history), (x + 10, 352, 272, 50), (125, 230, 145))

    # ORACLE panel with wrapped lines.
    _card(screen, (x, 419, 292, 113), fill=(25, 34, 49))
    _text(screen, heading, "✦ ORACLE  /  FIELD SCIENTIST", x + 11, 428, GOLD)
    lines = oracle_message.replace("\n", " ").split(" ")
    wrapped, line = [], ""
    for word in lines:
        candidate = (line + " " + word).strip()
        if len(candidate) > 39:
            wrapped.append(line)
            line = word
        else:
            line = candidate
    if line:
        wrapped.append(line)
    for i, row in enumerate(wrapped[:4]):
        _text(screen, tiny, row, x + 11, 453 + i * 16, TEXT)

    # Clear action groups.
    _text(screen, heading, "WORLD EVENTS", x, 544, MUTED)
    _button(screen, body, "PAUSE" if not paused else "RESUME", (x, 568, 137, 36), MINT)
    _button(screen, body, "RESET", (x + 147, 568, 145, 36), GOLD)
    _button(screen, body, "FEED WORLD", (x, 612, 137, 36), (132, 224, 153))
    _button(screen, body, "DROUGHT", (x + 147, 612, 145, 36), GOLD)
    _button(screen, body, "METEOR", (x, 656, 137, 36), CORAL)
    _button(screen, body, "ASK ORACLE", (x + 147, 656, 145, 36), BLUE)

    _text(screen, tiny, f"SIM SPEED  {speed}×     •     SPACE: PAUSE", x, 710, MUTED)
    _text(screen, tiny, "CLICK THE WORLD TO DROP FOOD", x, 729, MINT)
    _text(screen, tiny, "F food  D drought  M meteor  A oracle  R reset", x, 748, MUTED)
    _text(screen, tiny, "ORACLE is an offline, rule-based analyst.", x, 773, (105, 124, 148))
