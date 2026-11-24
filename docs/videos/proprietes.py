# Source of public/videos/proprietes-symetrie-centrale.mp4 (Manim Community). Needs construction.py in the same folder.
# Render:  python -m manim render -r 1280,720 --fps 30 proprietes.py ProprietesSymetrie   (then copy the .mp4 into public/videos/)

from manim import *
import numpy as np

from construction import (  # shared subtitle scene + palette (same folder)
    Subtitled, unit, SKY, PINK, ORANGE, GREEN, VIOLET, ROSE, TEXT,
)


def fr(x, digits=1):
    """French decimal formatting: 6.9 -> '6,9'."""
    s = f"{x:.{digits}f}".rstrip("0").rstrip(".")
    return s.replace(".", ",")


class ProprietesSymetrie(Subtitled):
    """Ce que la symétrie centrale conserve : longueurs, parallélisme, alignement, angles, aires, cercles."""

    def construct(self):
        O = np.array([0.0, 0.5, 0.0])
        mirror = lambda p: 2 * O - p

        # A quadrilateral with a 120° angle at B and AB = 2 (1 unit = 1 cm), plus a circle inside.
        B = np.array([-4.8, 2.0, 0.0])
        A = B + 2.0 * np.array([np.cos(np.radians(240)), np.sin(np.radians(240)), 0.0])
        C = B + np.array([3.0, 0.0, 0.0])
        D = np.array([-3.0, -0.3, 0.0])
        P = [A, B, C, D]
        Q = [mirror(p) for p in P]
        Ap, Bp, Cp, Dp = Q
        centre = np.array([-3.7, 1.0, 0.0])
        r = 0.9
        centre_p = mirror(centre)

        ab = np.linalg.norm(B - A)
        area = 0.5 * abs(sum(P[i][0] * P[(i + 1) % 4][1] - P[(i + 1) % 4][0] * P[i][1] for i in range(4)))
        cm = lambda v: f"{fr(v)} cm"

        # ── Titre ───────────────────────────────────────────────────────────
        title = Text("Les propriétés", font_size=62, color=TEXT, weight=BOLD)
        sub_title = Text("de la symétrie centrale", font_size=40, color=ORANGE)
        sub_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.play(FadeIn(sub_title, shift=UP * 0.2), run_time=0.8)
        self.say("Qu'est-ce qui ne change pas quand on fait un demi-tour autour de O ?", wait=2.0)
        self.play(FadeOut(title), FadeOut(sub_title), run_time=0.7)

        # ── La figure et son symétrique ─────────────────────────────────────
        fig = Polygon(*P, color=SKY, fill_color=SKY, fill_opacity=0.18, stroke_width=4)
        circ = Circle(radius=r, color=SKY, stroke_width=3).move_to(centre)
        o_cross = self.cross(O)
        o_label = Text("O", font_size=34, color=ORANGE, weight=BOLD).next_to(o_cross, DOWN + RIGHT * 0.3, buff=0.12)
        names = ["A", "B", "C", "D"]
        c_fig = sum(P) / 4
        labels = VGroup(*[
            Text(n, font_size=30, color=SKY, weight=BOLD).move_to(p + unit(p - c_fig) * 0.42) for n, p in zip(names, P)
        ])
        self.say("Voici une figure et le centre de symétrie O.",
                 Create(fig), Create(circ), FadeIn(labels), FadeIn(o_cross), FadeIn(o_label), run_time=1.6)

        img = VGroup(fig.copy(), circ.copy()).set_color(PINK)
        img[0].set_fill(PINK, opacity=0.18)
        self.say("On la fait tourner d'un demi-tour autour de O : on obtient sa symétrique.")
        self.play(Rotate(img, angle=PI, about_point=O), run_time=3.4, rate_func=smooth)
        c_img = sum(Q) / 4
        labels_p = VGroup(*[
            Text(n + "'", font_size=30, color=PINK, weight=BOLD).move_to(q + unit(q - c_img) * 0.5) for n, q in zip(names, Q)
        ])
        self.play(FadeIn(labels_p), run_time=0.6)
        self.wait(0.5)

        # ── 1. Les longueurs ────────────────────────────────────────────────
        seg = Line(A, B, color=GREEN, stroke_width=9)
        seg_p = Line(Ap, Bp, color=GREEN, stroke_width=9)
        t1 = Text(cm(ab), font_size=30, color=GREEN, weight=BOLD).move_to((A + B) / 2 + np.array([-0.8, 0.0, 0.0]))
        t2 = Text(cm(ab), font_size=30, color=GREEN, weight=BOLD).move_to((Ap + Bp) / 2 + np.array([0.8, 0.0, 0.0]))
        self.say("Les longueurs sont conservées : A'B' a la même longueur que AB.",
                 Create(seg), Create(seg_p), FadeIn(t1), FadeIn(t2), run_time=1.4)

        # ── 2. Droites parallèles ───────────────────────────────────────────
        d = unit(B - A)
        long1 = DashedLine(A - d * 3.2, B + d * 3.2, color=GREEN, stroke_width=4, dash_length=0.18)
        long2 = DashedLine(Ap - d * 3.2, Bp + d * 3.2, color=GREEN, stroke_width=4, dash_length=0.18)
        self.say("Et les deux segments sont parallèles : leurs droites ne se croisent jamais.",
                 Create(long1), Create(long2), run_time=1.6, wait=2.0)
        self.say("Deux droites symétriques sont donc parallèles.", FadeOut(long1), FadeOut(long2), wait=1.4)
        self.play(FadeOut(seg), FadeOut(seg_p), FadeOut(t1), FadeOut(t2), run_time=0.6)

        # ── 3. L'alignement ─────────────────────────────────────────────────
        M = (A + B) / 2
        Mp = mirror(M)
        m_dot, mp_dot = Dot(M, radius=0.12, color=ORANGE), Dot(Mp, radius=0.12, color=ORANGE)
        m_lab = Text("M", font_size=28, color=ORANGE, weight=BOLD).move_to(M + unit(M - c_fig) * 0.4)
        mp_lab = Text("M'", font_size=28, color=ORANGE, weight=BOLD).move_to(Mp + unit(Mp - c_img) * 0.45)
        line_m = Line(A, B, color=ORANGE, stroke_width=6)
        line_mp = Line(Ap, Bp, color=ORANGE, stroke_width=6)
        self.say("M est un point du segment [AB]. Son symétrique M' est sur le segment [A'B'].",
                 FadeIn(m_dot), FadeIn(mp_dot), FadeIn(m_lab), FadeIn(mp_lab), Create(line_m), Create(line_mp), run_time=1.4)
        self.say("Des points alignés ont des symétriques alignés.", wait=1.8)
        self.play(*[FadeOut(m) for m in (m_dot, mp_dot, m_lab, mp_lab, line_m, line_mp)], run_time=0.6)

        # ── 4. Les angles ───────────────────────────────────────────────────
        sec = Sector(radius=0.75, start_angle=np.radians(240), angle=np.radians(120), arc_center=B,
                     color=ORANGE, fill_opacity=0.45, stroke_width=3)
        sec_p = Sector(radius=0.75, start_angle=np.radians(60), angle=np.radians(120), arc_center=Bp,
                       color=ORANGE, fill_opacity=0.45, stroke_width=3)
        g1 = Text("120°", font_size=30, color=ORANGE, weight=BOLD).move_to(B + np.array([0.15, -1.25, 0.0]))
        g2 = Text("120°", font_size=30, color=ORANGE, weight=BOLD).move_to(Bp + np.array([-0.15, 1.25, 0.0]))
        self.say("Les angles sont conservés : l'angle en B' mesure autant que l'angle en B.",
                 FadeIn(sec), FadeIn(sec_p), FadeIn(g1), FadeIn(g2), run_time=1.4)
        self.play(FadeOut(sec), FadeOut(sec_p), FadeOut(g1), FadeOut(g2), run_time=0.6)

        # ── 5. Les aires ────────────────────────────────────────────────────
        a1 = Text(f"Aire = {fr(area)} cm²", font_size=28, color=VIOLET, weight=BOLD).move_to(np.array([c_fig[0], -1.35, 0.0]))
        a2 = Text(f"Aire = {fr(area)} cm²", font_size=28, color=VIOLET, weight=BOLD).move_to(np.array([c_img[0], 2.35, 0.0]))
        self.say("Les aires sont conservées : les deux figures occupent la même surface.",
                 fig.animate.set_fill(VIOLET, opacity=0.4), img[0].animate.set_fill(VIOLET, opacity=0.4),
                 FadeIn(a1), FadeIn(a2), run_time=1.4)
        self.play(fig.animate.set_fill(SKY, opacity=0.18), img[0].animate.set_fill(PINK, opacity=0.18),
                  FadeOut(a1), FadeOut(a2), run_time=0.8)

        # ── 6. Le cercle ────────────────────────────────────────────────────
        rad = Line(centre, centre + RIGHT * r, color=ROSE, stroke_width=6)
        rad_p = Line(centre_p, centre_p + LEFT * r, color=ROSE, stroke_width=6)
        i_dot, ip_dot = Dot(centre, radius=0.07, color=ROSE), Dot(centre_p, radius=0.07, color=ROSE)
        r1 = Text(f"{cm(r)}", font_size=19, color=ROSE, weight=BOLD).move_to(centre + np.array([0.42, 0.24, 0.0]))
        r2 = Text(f"{cm(r)}", font_size=19, color=ROSE, weight=BOLD).move_to(centre_p + np.array([-0.42, -0.24, 0.0]))
        self.say("Un cercle a pour symétrique un cercle de même rayon.",
                 Create(rad), Create(rad_p), FadeIn(i_dot), FadeIn(ip_dot), FadeIn(r1), FadeIn(r2), run_time=1.4)
        self.say("Et le centre du second cercle est le symétrique du centre du premier.", wait=2.2)

        # ── Récapitulatif ───────────────────────────────────────────────────
        self.say("Pour résumer :", *[FadeOut(m) for m in self.mobjects if m is not self.sub], run_time=0.9, wait=0.8)
        items = [
            ("Les longueurs sont conservées", GREEN),
            ("Les angles sont conservés", ORANGE),
            ("Les aires sont conservées", VIOLET),
            ("Les points alignés restent alignés", SKY),
            ("Deux droites symétriques sont parallèles", PINK),
            ("Un cercle devient un cercle de même rayon", ROSE),
        ]
        rows = VGroup(*[
            Text(f"•  {t}", font_size=36, color=c, weight=BOLD) for t, c in items
        ]).arrange(DOWN, aligned_edge=LEFT, buff=0.38).move_to(np.array([0.0, 0.3, 0.0]))
        for row in rows:
            self.play(FadeIn(row, shift=RIGHT * 0.4), run_time=0.7)
            self.wait(0.5)
        self.say("La symétrie centrale déplace la figure, mais ne la déforme pas.", wait=3.2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)
