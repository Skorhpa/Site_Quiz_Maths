# Source of public/videos/symetrie-centrale-demi-tour.mp4 (Manim Community, https://docs.manim.community).
# Render:  python -m manim render -r 1280,720 --fps 30 demi_tour.py DemiTour   (then copy the .mp4 into public/videos/)

from manim import *
import numpy as np

# SiteMath palette
BG = "#0F1117"
SKY = "#38BDF8"
PINK = "#F472B6"
ORANGE = "#FB923C"
GREEN = "#4ADE80"
TEXT = "#F0EDE8"

config.background_color = BG
Text.set_default(font="Arial")


class DemiTour(Scene):
    """La symétrie centrale = un demi-tour autour d'un point (avec sous-titres)."""

    def construct(self):
        self.sub = None
        O = np.array([0.0, 0.6, 0.0])

        # ── 0. Titre ────────────────────────────────────────────────────────
        title = Text("La symétrie centrale", font_size=64, color=TEXT, weight=BOLD)
        sub_title = Text("Un demi-tour autour d'un point", font_size=34, color=ORANGE)
        sub_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.play(FadeIn(sub_title, shift=UP * 0.2), run_time=0.8)
        self.say("Voyons ce que fait une symétrie centrale.", wait=1.6)
        self.play(FadeOut(title), FadeOut(sub_title), run_time=0.7)

        # ── 1. Un point et son centre ───────────────────────────────────────
        A = np.array([-2.7, 1.5, 0.0])
        o_cross = self.cross(O, ORANGE)
        o_label = Text("O", font_size=34, color=ORANGE, weight=BOLD).next_to(o_cross, DOWN + RIGHT * 0.2, buff=0.15)
        a_dot = Dot(A, radius=0.11, color=SKY)
        a_label = Text("A", font_size=34, color=SKY, weight=BOLD).next_to(a_dot, UP, buff=0.18)
        self.say("Voici un point A et le centre de la symétrie, le point O.",
                 FadeIn(o_cross), FadeIn(o_label), FadeIn(a_dot), FadeIn(a_label))

        # ── 2. La demi-droite [AO) ──────────────────────────────────────────
        Ap = 2 * O - A
        ray = DashedLine(A, Ap + (Ap - A) * 0.12, color=TEXT, stroke_width=3, dash_length=0.15)
        self.say("On trace la demi-droite qui part de A et passe par O.", Create(ray), run_time=1.6)

        # ── 3. Le demi-tour ─────────────────────────────────────────────────
        radius = np.linalg.norm(A - O)
        start_angle = np.arctan2(A[1] - O[1], A[0] - O[0])
        arc = Arc(radius=radius, start_angle=start_angle, angle=PI, arc_center=O,
                  color=PINK, stroke_width=4)
        moving = Dot(A, radius=0.11, color=PINK)
        self.say("Maintenant, on fait faire à A un demi-tour autour de O.")
        self.play(Create(arc), Rotate(moving, angle=PI, about_point=O), run_time=3.2, rate_func=smooth)
        ap_label = Text("A'", font_size=34, color=PINK, weight=BOLD).next_to(moving, DOWN, buff=0.18)
        self.play(FadeIn(ap_label), run_time=0.5)

        # ── 4. O milieu de [AA'] ────────────────────────────────────────────
        ticks = VGroup(*[self.tick(A, O, ORANGE), self.tick(O, Ap, ORANGE)])
        self.say("On obtient A'. Le point O est le milieu du segment [AA'].", Create(ticks), run_time=1.2)
        self.wait(0.6)

        # ── 5. Une figure entière ───────────────────────────────────────────
        self.say("Pour une figure, on fait la même chose avec chaque sommet.",
                 *[FadeOut(m) for m in (ray, arc, moving, ap_label, a_dot, a_label, ticks)])

        P = [np.array([-3.4, 1.5, 0.0]), np.array([-1.5, 2.4, 0.0]), np.array([-2.1, 0.0, 0.0])]
        tri = Polygon(*P, color=SKY, fill_color=SKY, fill_opacity=0.25, stroke_width=4)
        names = ["A", "B", "C"]
        centroid = sum(P) / 3
        labels = VGroup(*[
            Text(n, font_size=32, color=SKY, weight=BOLD).move_to(p + self.unit(p - centroid) * 0.45)
            for n, p in zip(names, P)
        ])
        self.play(Create(tri), FadeIn(labels), run_time=1.4)

        img = tri.copy().set_color(PINK)
        img.set_fill(PINK, opacity=0.25)
        links = VGroup(*[DashedLine(p, 2 * O - p, color=TEXT, stroke_width=2, dash_length=0.12, stroke_opacity=0.5) for p in P])
        self.say("Toute la figure fait un demi-tour autour de O.", Create(links), run_time=1.2)
        self.play(Rotate(img, angle=PI, about_point=O), run_time=3.6, rate_func=smooth)
        Q = [2 * O - p for p in P]
        q_centroid = sum(Q) / 3
        q_labels = VGroup(*[
            Text(n + "'", font_size=32, color=PINK, weight=BOLD).move_to(q + self.unit(q - q_centroid) * 0.5)
            for n, q in zip(names, Q)
        ])
        self.play(FadeIn(q_labels), run_time=0.6)
        self.wait(0.6)

        # ── 6. Ce qui est conservé ──────────────────────────────────────────
        fact1 = Text("AB = A'B'", font_size=34, color=GREEN, weight=BOLD)
        fact2 = Text("mêmes angles, même aire", font_size=30, color=GREEN)
        facts = VGroup(fact1, fact2).arrange(RIGHT, buff=0.6).move_to(np.array([0.0, 3.55, 0.0]))
        self.say("La figure et son symétrique ont les mêmes mesures.", FadeIn(facts), run_time=1.0, wait=2.4)
        self.say("Voilà : la symétrie centrale conserve les longueurs, les angles et les aires.", wait=3.0)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)

    # ── helpers ─────────────────────────────────────────────────────────────

    @staticmethod
    def unit(v):
        n = np.linalg.norm(v)
        return v / n if n else v

    def cross(self, p, color, s=0.2):
        return VGroup(
            Line(p + np.array([-s, -s, 0]), p + np.array([s, s, 0]), color=color, stroke_width=6),
            Line(p + np.array([-s, s, 0]), p + np.array([s, -s, 0]), color=color, stroke_width=6),
        )

    def tick(self, p, q, color):
        mid = (p + q) / 2
        d = self.unit(q - p)
        perp = np.array([-d[1], d[0], 0.0]) * 0.18
        return Line(mid - perp, mid + perp, color=color, stroke_width=5)

    def make_sub(self, text):
        txt = Text(text, font_size=30, color=WHITE)
        if txt.width > 12.2:
            txt.scale_to_fit_width(12.2)
        bg = BackgroundRectangle(txt, color=BLACK, fill_opacity=0.72, buff=0.22, corner_radius=0.12)
        group = VGroup(bg, txt)
        group.to_edge(DOWN, buff=0.3)
        group.set_z_index(100)
        return group

    def say(self, text, *anims, run_time=1.4, wait=None):
        """Swap the subtitle (fade), then play the animations, then leave time to read."""
        new = self.make_sub(text)
        swap = [FadeIn(new)]
        if self.sub is not None:
            swap.append(FadeOut(self.sub))
        self.play(*swap, run_time=0.45)
        self.sub = new
        if anims:
            self.play(*anims, run_time=run_time)
        self.wait(wait if wait is not None else max(1.3, len(text) / 20))
