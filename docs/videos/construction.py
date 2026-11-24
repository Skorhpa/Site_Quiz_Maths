# Source of public/videos/construction-quadrillage.mp4 and construction-sans-quadrillage.mp4 (Manim Community).
# Render:  python -m manim render -r 1280,720 --fps 30 construction.py ConstructionQuadrillage
#          python -m manim render -r 1280,720 --fps 30 construction.py ConstructionPapier   (then copy the .mp4 files into public/videos/)

from manim import *
from manim.utils.space_ops import angle_of_vector
import numpy as np

# SiteMath palette
BG = "#0F1117"
SKY = "#38BDF8"
PINK = "#F472B6"
ORANGE = "#FB923C"
GREEN = "#4ADE80"
VIOLET = "#A78BFA"
ROSE = "#FB7185"
TEXT = "#F0EDE8"
GRID = "#2B3040"

config.background_color = BG
Text.set_default(font="Arial")


def unit(v):
    n = np.linalg.norm(v)
    return v / n if n else v


class Subtitled(Scene):
    """Scene with a subtitle bar at the bottom (burned into the video)."""

    def setup(self):
        self.sub = None

    def make_sub(self, text):
        txt = Text(text, font_size=30, color=WHITE)
        if txt.width > 12.4:
            txt.scale_to_fit_width(12.4)
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
        self.wait(wait if wait is not None else max(1.1, len(text) / 22))

    def clear_scene(self):
        others = [m for m in self.mobjects if m is not self.sub]
        if others:
            self.play(*[FadeOut(m) for m in others], run_time=0.8)

    def cross(self, p, color=ORANGE, s=0.2):
        return VGroup(
            Line(p + np.array([-s, -s, 0]), p + np.array([s, s, 0]), color=color, stroke_width=6),
            Line(p + np.array([-s, s, 0]), p + np.array([s, -s, 0]), color=color, stroke_width=6),
        )

    def tick(self, p, q, color=ORANGE):
        mid = (p + q) / 2
        d = unit(q - p)
        perp = np.array([-d[1], d[0], 0.0]) * 0.18
        return Line(mid - perp, mid + perp, color=color, stroke_width=5)

    def label(self, text, p, away_from, color, size=32, dist=0.42):
        return Text(text, font_size=size, color=color, weight=BOLD).move_to(p + unit(p - away_from) * dist)


# ════════════════════════════════════════════════════════════════════════════
#  Construction sur quadrillage : on compte les carreaux, puis on répète
# ════════════════════════════════════════════════════════════════════════════

U = 0.6      # side of one square
Y0 = 0.6     # vertical offset of the grid origin (O)


def G(gx, gy):
    return np.array([gx * U, gy * U + Y0, 0.0])


class ConstructionQuadrillage(Subtitled):
    def construct(self):
        grid = VGroup(
            *[Line(G(x, -5), G(x, 5), color=GRID, stroke_width=1.5) for x in range(-11, 12)],
            *[Line(G(-11, y), G(11, y), color=GRID, stroke_width=1.5) for y in range(-5, 6)],
        )
        O = G(0, 0)
        Agrid = (-4, 3)
        A = G(*Agrid)
        Ap = G(4, -3)

        title = Text("Symétrique sur un quadrillage", font_size=52, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("On compte les carreaux, puis on refait le même déplacement.", wait=1.6)
        self.play(FadeOut(title), FadeIn(grid), run_time=0.9)

        o_cross = self.cross(O)
        o_label = Text("O", font_size=34, color=ORANGE, weight=BOLD).next_to(o_cross, DOWN + RIGHT * 0.3, buff=0.12)
        a_dot = Dot(A, radius=0.11, color=SKY)
        a_label = self.label("A", A, O, SKY)
        self.say("Voici un point A et le centre O. On cherche le symétrique de A.",
                 FadeIn(o_cross), FadeIn(o_label), FadeIn(a_dot), FadeIn(a_label))

        # ── 1. A → O : horizontally, then vertically ────────────────────────
        walk1 = VGroup()
        self.say("On compte les carreaux horizontalement, de A à O : 4 vers la droite.")
        walk1.add(*self.count_squares((-4, 3), 4, 0, GREEN, hside=UP))
        self.say("Puis verticalement : 3 carreaux vers le bas.")
        walk1.add(*self.count_squares((0, 3), 0, -3, ROSE, vside=LEFT))

        # ── 2. Same moves again, starting from O ────────────────────────────
        walk2 = VGroup()
        self.say("On refait le même déplacement depuis O : 4 carreaux vers la droite…")
        walk2.add(*self.count_squares((0, 0), 4, 0, GREEN, hside=DOWN))
        self.say("…puis 3 carreaux vers le bas.")
        walk2.add(*self.count_squares((4, 0), 0, -3, ROSE, vside=RIGHT))

        ap_dot = Dot(Ap, radius=0.11, color=PINK)
        ap_label = self.label("A'", Ap, O, PINK)
        self.say("On arrive au point A' : c'est le symétrique de A par rapport à O.",
                 FadeIn(ap_dot, scale=2), FadeIn(ap_label))

        # ── 3. Repeat for the other vertices ────────────────────────────────
        self.say("Pour une figure, on répète pour chaque sommet.",
                 FadeOut(walk1), FadeOut(walk2))
        B, C = (-8, 1), (-3, -1)
        Bp, Cp = (8, -1), (3, 1)
        tri = Polygon(G(*Agrid), G(*B), G(*C), color=SKY, fill_color=SKY, fill_opacity=0.2, stroke_width=4)
        b_dot, c_dot = Dot(G(*B), radius=0.11, color=SKY), Dot(G(*C), radius=0.11, color=SKY)
        b_label = self.label("B", G(*B), O, SKY)
        c_label = self.label("C", G(*C), O, SKY)
        self.play(Create(tri), FadeIn(b_dot), FadeIn(c_dot), FadeIn(b_label), FadeIn(c_label), run_time=1.4)

        self.say("Pour B : 8 carreaux vers la droite, 1 vers le bas. Puis on refait depuis O.")
        moves_b = self.quick_moves(B, 8, -1)
        bp_dot = Dot(G(*Bp), radius=0.11, color=PINK)
        bp_label = self.label("B'", G(*Bp), O, PINK)
        self.play(FadeIn(bp_dot, scale=2), FadeIn(bp_label), run_time=0.7)

        self.say("Pour C : 3 carreaux vers la droite, 1 vers le haut. Puis on refait depuis O.",
                 FadeOut(moves_b))
        moves_c = self.quick_moves(C, 3, 1)
        cp_dot = Dot(G(*Cp), radius=0.11, color=PINK)
        cp_label = self.label("C'", G(*Cp), O, PINK)
        self.play(FadeIn(cp_dot, scale=2), FadeIn(cp_label), run_time=0.7)

        tri_img = Polygon(G(4, -3), G(*Bp), G(*Cp), color=PINK, fill_color=PINK, fill_opacity=0.2, stroke_width=4)
        self.say("On relie A', B' et C' : on obtient le triangle symétrique.", FadeOut(moves_c), Create(tri_img), run_time=1.6)

        self.say("La méthode : on compte les carreaux horizontalement, puis verticalement.", wait=2.2)
        self.say("Et on refait le même déplacement en partant de O.", wait=2.6)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)

    # helpers ---------------------------------------------------------------

    def count_squares(self, g0, dx, dy, color, hside=UP, vside=RIGHT):
        """Count the squares one by one (a coloured segment and its number for each). dx first or dy first, never both."""
        made = []
        x, y = g0
        if dx:
            s = 1 if dx > 0 else -1
            for k in range(abs(dx)):
                a, b = G(x + s * k, y), G(x + s * (k + 1), y)
                seg = Line(a, b, color=color, stroke_width=8)
                num = Text(str(k + 1), font_size=28, color=color, weight=BOLD).move_to((a + b) / 2 + hside * 0.3)
                self.play(Create(seg), FadeIn(num, scale=0.6), run_time=0.42)
                made += [seg, num]
        if dy:
            s = 1 if dy > 0 else -1
            for k in range(abs(dy)):
                a, b = G(x, y + s * k), G(x, y + s * (k + 1))
                seg = Line(a, b, color=color, stroke_width=8)
                num = Text(str(k + 1), font_size=28, color=color, weight=BOLD).move_to((a + b) / 2 + vside * 0.34)
                self.play(Create(seg), FadeIn(num, scale=0.6), run_time=0.42)
                made += [seg, num]
        self.wait(0.4)
        return made

    def quick_moves(self, g, dx, dy):
        """Horizontal then vertical move to O, then the same move from O — drawn at once, with the counts."""
        x, y = g
        first = [
            Arrow(G(x, y), G(0, y), buff=0, color=GREEN, stroke_width=7, max_tip_length_to_length_ratio=0.12),
            Arrow(G(0, y), G(0, 0), buff=0, color=ROSE, stroke_width=7, max_tip_length_to_length_ratio=0.25),
        ]
        second = [
            Arrow(G(0, 0), G(dx, 0), buff=0, color=GREEN, stroke_width=7, max_tip_length_to_length_ratio=0.12),
            Arrow(G(dx, 0), G(dx, dy), buff=0, color=ROSE, stroke_width=7, max_tip_length_to_length_ratio=0.25),
        ]
        cnt = lambda n, p, off, c: Text(str(abs(n)), font_size=28, color=c, weight=BOLD).move_to(p + off)
        labels = [
            cnt(dx, (G(x, y) + G(0, y)) / 2, UP * 0.32, GREEN),
            cnt(dy, (G(0, y) + G(0, 0)) / 2, LEFT * 0.34, ROSE),
            cnt(dx, (G(0, 0) + G(dx, 0)) / 2, UP * 0.32, GREEN),
            cnt(dy, (G(dx, 0) + G(dx, dy)) / 2, RIGHT * 0.34, ROSE),
        ]
        self.play(*[GrowArrow(a) for a in first], *[FadeIn(l) for l in labels[:2]], run_time=1.3)
        self.play(*[GrowArrow(a) for a in second], *[FadeIn(l) for l in labels[2:]], run_time=1.3)
        self.wait(0.6)
        return VGroup(*first, *second, *labels)


# ════════════════════════════════════════════════════════════════════════════
#  Construction sans quadrillage : règle et compas (puis règle graduée seule)
# ════════════════════════════════════════════════════════════════════════════

class ConstructionPapier(Subtitled):
    def construct(self):
        O = np.array([0.0, 0.4, 0.0])
        A = O + np.array([-3.2, 2.4, 0.0])      # |AO| = 4.0 exactly
        B = O + np.array([-5.0, 0.2, 0.0])
        C = O + np.array([-1.6, -1.5, 0.0])
        mirror = lambda p: 2 * O - p
        Ap, Bp, Cp = mirror(A), mirror(B), mirror(C)

        title = Text("Symétrique sans quadrillage", font_size=52, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("On utilise la règle et le compas.", wait=1.4)
        self.play(FadeOut(title), run_time=0.6)

        # triangle + centre
        tri = Polygon(A, B, C, color=SKY, fill_color=SKY, fill_opacity=0.2, stroke_width=4)
        labels = VGroup(self.label("A", A, O, SKY), self.label("B", B, O, SKY), self.label("C", C, O, SKY))
        o_cross = self.cross(O)
        o_label = Text("O", font_size=34, color=ORANGE, weight=BOLD).next_to(o_cross, DOWN + RIGHT * 0.3, buff=0.12)
        self.say("On veut construire le symétrique du triangle ABC par rapport à O.",
                 Create(tri), FadeIn(labels), FadeIn(o_cross), FadeIn(o_label), run_time=1.6)

        # ── A : la demi-droite [AO) à la règle ──────────────────────────────
        ray_A = Line(A, O + (O - A) * 1.32, color=TEXT, stroke_width=3)
        ruler = self.ruler(A, O, 9.0, numbers=False)
        self.say("On commence par A. On pose la règle sur A et sur O…", FadeIn(ruler), run_time=0.9)
        self.say("…et on trace la demi-droite qui part de A et passe par O.", Create(ray_A), run_time=1.4)
        self.play(FadeOut(ruler), run_time=0.6)

        # ── A : le compas ───────────────────────────────────────────────────
        comp1 = self.compass(A, O)
        self.say("On prend le compas : la pointe sur A, la mine sur O. On mesure la longueur AO.", FadeIn(comp1), run_time=1.0)

        comp2 = self.compass(O, Ap)
        radius = np.linalg.norm(A - O)
        base_angle = angle_of_vector(Ap - O)
        arc = Arc(radius=radius, start_angle=base_angle - 0.30, angle=0.60, arc_center=O, color=PINK, stroke_width=5)
        self.say("On garde cet écartement. On pose la pointe sur O et on trace un arc de l'autre côté.")
        self.play(Transform(comp1, comp2), run_time=2.2, rate_func=smooth)
        self.play(Create(arc), run_time=1.0)
        self.play(FadeOut(comp1), run_time=0.6)

        ap_dot = Dot(Ap, radius=0.11, color=PINK)
        ap_label = self.label("A'", Ap, O, PINK)
        ticks = VGroup(self.tick(A, O), self.tick(O, Ap))
        self.say("A' est à l'intersection de la demi-droite et de l'arc. Le point O est le milieu de [AA'].",
                 FadeIn(ap_dot, scale=2), FadeIn(ap_label), Create(ticks), run_time=1.2)

        # ── B et C : même méthode ───────────────────────────────────────────
        self.say("On recommence de la même façon pour B, puis pour C.")
        extras = []
        for P_, Pp, name in ((B, Bp, "B'"), (C, Cp, "C'")):
            ray = Line(P_, O + (O - P_) * 1.28, color=TEXT, stroke_width=3)
            r = np.linalg.norm(P_ - O)
            ang = angle_of_vector(Pp - O)
            arc_p = Arc(radius=r, start_angle=ang - 0.30, angle=0.60, arc_center=O, color=PINK, stroke_width=5)
            dot = Dot(Pp, radius=0.11, color=PINK)
            lab = self.label(name, Pp, O, PINK)
            self.play(Create(ray), run_time=0.9)
            self.play(Create(arc_p), run_time=0.9)
            self.play(FadeIn(dot, scale=2), FadeIn(lab), run_time=0.6)
            extras += [ray, arc_p]
        tri_img = Polygon(Ap, Bp, Cp, color=PINK, fill_color=PINK, fill_opacity=0.2, stroke_width=4)
        self.say("On relie A', B' et C' : on obtient le triangle symétrique.", Create(tri_img), run_time=1.6)

        # ── Variante : la règle graduée seule ───────────────────────────────
        self.say("Sans compas, on peut aussi utiliser la règle graduée.")
        self.clear_scene()

        O_cross = self.cross(O)
        O_lab = Text("O", font_size=34, color=ORANGE, weight=BOLD).next_to(O_cross, DOWN + RIGHT * 0.3, buff=0.12)
        a_dot = Dot(A, radius=0.11, color=SKY)
        a_lab = self.label("A", A, O, SKY)
        ray = Line(A, O + (O - A) * 1.32, color=TEXT, stroke_width=3)
        self.play(FadeIn(O_cross), FadeIn(O_lab), FadeIn(a_dot), FadeIn(a_lab), Create(ray), run_time=1.2)

        ruler2 = self.ruler(A, O, 9.0, numbers=True)
        self.say("On pose la règle graduée sur la demi-droite, le zéro sur A.", FadeIn(ruler2), run_time=1.0)
        seg1 = Line(A, O, color=GREEN, stroke_width=8)
        lab1 = Text("AO = 4 cm", font_size=32, color=GREEN, weight=BOLD).move_to((A + O) / 2 + np.array([-0.9, -0.95, 0]))
        self.say("On lit la longueur AO : 4 cm.", Create(seg1), FadeIn(lab1), run_time=1.0)
        seg2 = Line(O, Ap, color=PINK, stroke_width=8)
        lab2 = Text("OA' = 4 cm", font_size=32, color=PINK, weight=BOLD).move_to((O + Ap) / 2 + np.array([-0.9, -0.95, 0]))
        ap2 = Dot(Ap, radius=0.11, color=PINK)
        ap2_lab = self.label("A'", Ap, O, PINK)
        self.say("De l'autre côté de O, on reporte la même longueur : 4 cm. On marque A'.",
                 Create(seg2), FadeIn(lab2), FadeIn(ap2, scale=2), FadeIn(ap2_lab), run_time=1.4)

        self.say("Compas ou règle graduée : O doit être le milieu de [AA'].", wait=3.2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)

    # helpers ---------------------------------------------------------------

    def ruler(self, p, q, length, numbers):
        """A ruler lying along the line p→q (0 at p, 1 cm = 1 unit), on the upper side of the line."""
        d = unit(q - p)
        ang = angle_of_vector(d)
        parts = [Rectangle(width=length + 0.25, height=0.62, color="#C9B26B", fill_color="#C9B26B",
                           fill_opacity=0.28, stroke_width=2).move_to(np.array([(length - 0.05) / 2, 0.31, 0]))]
        k = 0.0
        while k <= length + 1e-9:
            big = abs(k - round(k)) < 1e-9
            parts.append(Line(np.array([k, 0, 0]), np.array([k, 0.24 if big else 0.13, 0]), color="#E8D9A0", stroke_width=2))
            if numbers and big and int(round(k)) % 1 == 0:
                parts.append(Text(str(int(round(k))), font_size=18, color="#E8D9A0").move_to(np.array([k, 0.42, 0])))
            k += 0.5
        grp = VGroup(*parts)
        grp.rotate(ang, about_point=ORIGIN)
        grp.shift(p)
        grp.set_z_index(5)
        return grp

    def compass(self, needle, pencil):
        """A drawing compass: needle on `needle`, pencil on `pencil`, hinge above."""
        d = unit(pencil - needle)
        n = np.array([-d[1], d[0], 0.0])
        if n[1] < 0:
            n = -n
        hinge = (needle + pencil) / 2 + n * 2.1
        grp = VGroup(
            Line(hinge, needle, color="#CBD5E1", stroke_width=6),
            Line(hinge, pencil, color="#CBD5E1", stroke_width=6),
            Dot(hinge, radius=0.13, color="#94A3B8"),
            Dot(needle, radius=0.06, color=WHITE),
            Dot(pencil, radius=0.07, color=ORANGE),
        )
        grp.set_z_index(6)
        return grp
