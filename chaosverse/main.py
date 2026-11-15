import pygame
from chaosverse.config import SCREEN_WIDTH, SCREEN_HEIGHT, WORLD_WIDTH, FPS
from chaosverse.world import World
from chaosverse.ui import draw_app

def main():
    pygame.init()
    pygame.display.set_caption("CHAOSVERSE | Human × AI Artificial Life")
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    clock = pygame.time.Clock()
    world = World()
    running = True
    paused = False
    speed = 1
    oracle_message = world.oracle.analyze(world)

    while running:
        dt = min(clock.tick(FPS) / 1000.0, 0.05)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_SPACE:
                    paused = not paused
                elif event.key == pygame.K_r:
                    world = World()
                    oracle_message = world.oracle.analyze(world)
                elif event.key == pygame.K_1:
                    speed = 1
                elif event.key == pygame.K_2:
                    speed = 2
                elif event.key == pygame.K_3:
                    speed = 4
                elif event.key == pygame.K_f:
                    world.food_boom()
                elif event.key == pygame.K_d:
                    world.drought()
                elif event.key == pygame.K_m:
                    world.meteor_strike()
                elif event.key == pygame.K_a:
                    oracle_message = world.oracle.analyze(world)
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1 and event.pos[0] < WORLD_WIDTH:
                    world.drop_food(*event.pos)
                action = world.handle_click(event.pos)
                if action == "pause":
                    paused = not paused
                elif action == "reset":
                    world = World()
                    oracle_message = world.oracle.analyze(world)
                elif action == "food":
                    world.food_boom()
                elif action == "drought":
                    world.drought()
                elif action == "meteor":
                    world.meteor_strike()
                elif action == "oracle":
                    oracle_message = world.oracle.analyze(world)
                elif action == "speed":
                    speed = speed % 4 + 1
                    if speed == 3:
                        speed = 4

        keys = pygame.key.get_pressed()
        if not paused:
            for _ in range(speed):
                world.update(dt)

        draw_app(screen, world, paused, speed, oracle_message)
        pygame.display.flip()

    pygame.quit()

if __name__ == "__main__":
    main()
