# Source of public/videos/relatifs-definitions.mp4, relatifs-reperage-droite.mp4, relatifs-comparaison.mp4, relatifs-reperage-repere.mp4 (Manim Community). Needs relatifs.py and construction.py in the same folder.
# Render:  python -m manim render -r 1280,720 --fps 30 notions.py DefinitionsRelatifs   (also ReperageDroite, ComparaisonRelatifs, ReperageRepere; then copy the .mp4 files into public/videos/)

from manim import *
import numpy as np

from relatifs import RelBase, M  # RelBase = subtitles + number-line helpers (relatifs.py / construction.py, same folder)
from construction import SKY, PINK, ORANGE, GREEN, VIOLET, ROSE, TEXT


def fr(v):
    """−2,5 / 3 / 0,5 (French decimals, true minus sign)."""
    s = f"{abs(v):g}".replace(".", ",")
    return (M if v < 0 else "") + s


def cross_at(p, color, s=0.16):
    return VGroup(
        Line(p + np.array([-s, -s, 0]), p + np.array([s, s, 0]), color=color, stroke_width=5),
        Line(p + np.array([-s, s, 0]), p + np.array([s, -s, 0]), color=color, stroke_width=5),
    )


def tag(text, p, color, fs=30, up=0.5):
    return Text(text, font_size=fs, color=color, weight=BOLD).move_to(p + UP * up)


# ════════════════════════════════════════════════════════════════════════════
#  1. Définitions : positif, négatif, relatif, opposé
# ════════════════════════════════════════════════════════════════════════════

class DefinitionsRelatifs(RelBase):
    def construct(self):
        title = Text("Les nombres relatifs", font_size=60, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("Positifs, négatifs, relatifs, opposés : voyons ce que ces mots veulent dire.", wait=2.0)
        self.play(FadeOut(title), run_time=0.6)

        ax = self.axis()
        self.play(Create(ax), run_time=1.2)

        # ── positifs ────────────────────────────────────────────────────────
        pos_band = Rectangle(width=self.p(8.4)[0] - self.p(0)[0], height=1.0, stroke_width=0, fill_color=GREEN, fill_opacity=0.2)
        pos_band.move_to(np.array([(self.p(8.4)[0] + self.p(0)[0]) / 2, self.Y0 + 0.5, 0]))
        pos_dots = VGroup(*[Dot(self.p(n), radius=0.11, color=GREEN) for n in (2, 5, 7)])
        pos_tags = VGroup(*[tag("+" + str(n), self.p(n), GREEN, up=0.75) for n in (2, 5, 7)])
        pos_title = Text("nombres positifs", font_size=36, color=GREEN, weight=BOLD).move_to(np.array([self.p(4.2)[0], 1.4, 0]))
        self.say("Un nombre positif est un nombre supérieur ou égal à zéro.",
                 FadeIn(pos_band), FadeIn(pos_dots), FadeIn(pos_tags), FadeIn(pos_title), run_time=1.4, wait=1.6)

        # ── négatifs ────────────────────────────────────────────────────────
        neg_band = Rectangle(width=self.p(0)[0] - self.p(-8.4)[0], height=1.0, stroke_width=0, fill_color=ROSE, fill_opacity=0.2)
        neg_band.move_to(np.array([(self.p(-8.4)[0] + self.p(0)[0]) / 2, self.Y0 + 0.5, 0]))
        neg_dots = VGroup(*[Dot(self.p(n), radius=0.11, color=ROSE) for n in (-2, -5, -7)])
        neg_tags = VGroup(*[tag(M + str(abs(n)), self.p(n), ROSE, up=0.75) for n in (-2, -5, -7)])
        neg_title = Text("nombres négatifs", font_size=36, color=ROSE, weight=BOLD).move_to(np.array([self.p(-4.2)[0], 1.4, 0]))
        self.say("Un nombre négatif est un nombre inférieur ou égal à zéro.",
                 FadeIn(neg_band), FadeIn(neg_dots), FadeIn(neg_tags), FadeIn(neg_title), run_time=1.4, wait=1.6)

        # ── zéro ────────────────────────────────────────────────────────────
        zero = Dot(self.p(0), radius=0.16, color=ORANGE)
        zero_t = Text("0 est à la fois positif et négatif", font_size=34, color=ORANGE, weight=BOLD).move_to(np.array([0.0, 3.0, 0.0]))
        self.say("Le nombre 0 est à la fois positif et négatif.", FadeIn(zero), FadeIn(zero_t), run_time=1.0, wait=1.8)
        self.play(FadeOut(zero_t), run_time=0.5)

        # ── relatifs ────────────────────────────────────────────────────────
        brace = Brace(Line(self.p(-8.4), self.p(8.4)), UP, buff=2.7, color=VIOLET)
        rel_t = Text("nombres relatifs", font_size=40, color=VIOLET, weight=BOLD).next_to(brace, UP, buff=0.15)
        self.say("Un nombre relatif est un nombre positif ou négatif.", FadeIn(brace), FadeIn(rel_t), run_time=1.2, wait=2.0)

        # ── opposés ─────────────────────────────────────────────────────────
        self.say("Voyons maintenant l'opposé d'un nombre.",
                 *[FadeOut(m) for m in (pos_band, neg_band, pos_dots, neg_dots, pos_tags, neg_tags, pos_title, neg_title, brace, rel_t, zero)],
                 run_time=0.9, wait=0.8)
        for n, color_a, color_b in ((3, GREEN, ROSE), (-6, ROSE, GREEN)):
            a, b = n, -n
            ja, la = self.jump(0, a, 0, color_a, self.signed(a))
            jb, lb = self.jump(0, b, 1, color_b, self.signed(b))
            da, db = Dot(self.p(a), radius=0.13, color=color_a), Dot(self.p(b), radius=0.13, color=color_b)
            eq = Text(f"L'opposé de {self.signed(a)} est {self.signed(b)}", font_size=46, color=TEXT, weight=BOLD).move_to(np.array([0.0, 3.0, 0.0]))
            why = Text(f"même nombre, signe contraire : {abs(a)} et {abs(b)} sont à la même distance de 0", font_size=28, color=ORANGE).move_to(np.array([0.0, 2.2, 0.0]))
            self.say("On obtient l'opposé d'un nombre en changeant son signe." if n == 3 else
                     "Un autre exemple : l'opposé de −6 est +6.", FadeIn(eq, shift=UP * 0.2), run_time=0.9, wait=0.6)
            self.play(Create(ja), FadeIn(la), FadeIn(da), run_time=1.0)
            self.play(Create(jb), FadeIn(lb), FadeIn(db), FadeIn(why), run_time=1.2)
            self.wait(2.0)
            self.play(*[FadeOut(m) for m in (ja, la, jb, lb, da, db, eq, why)], run_time=0.6)

        # ── récapitulatif ───────────────────────────────────────────────────
        self.say("Pour résumer :", *[FadeOut(m) for m in self.mobjects if m is not self.sub], run_time=0.8, wait=0.6)
        items = [
            ("Positif : supérieur ou égal à 0", GREEN),
            ("Négatif : inférieur ou égal à 0", ROSE),
            ("Relatif : positif ou négatif", VIOLET),
            ("Opposé : on change le signe", ORANGE),
        ]
        rows = VGroup(*[Text(f"•  {t}", font_size=38, color=c, weight=BOLD) for t, c in items]).arrange(DOWN, aligned_edge=LEFT, buff=0.5)
        rows.move_to(np.array([0.0, 0.5, 0.0]))
        for r in rows:
            self.play(FadeIn(r, shift=RIGHT * 0.4), run_time=0.7)
            self.wait(0.6)
        self.say("À toi de jouer !", wait=2.2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)


# ════════════════════════════════════════════════════════════════════════════
#  2. Repérage sur une droite graduée
# ════════════════════════════════════════════════════════════════════════════

class ReperageDroite(RelBase):
    def graduated(self, vals, labeled, scale, y):
        """A line with a tick for every value in `vals` and a number under the ticks listed in `labeled`."""
        lo, hi = min(vals), max(vals)
        parts = [Line(np.array([lo * scale - 0.6, y, 0]), np.array([hi * scale + 0.9, y, 0]), color="#9CA3AF", stroke_width=4),
                 Triangle(color="#9CA3AF", fill_opacity=1).scale(0.12).rotate(-PI / 2).move_to(np.array([hi * scale + 0.9, y, 0]))]
        for v in vals:
            parts.append(Line(np.array([v * scale, y - 0.15, 0]), np.array([v * scale, y + 0.15, 0]), color="#9CA3AF", stroke_width=3))
            if v in labeled:
                parts.append(Text(fr(v), font_size=26, color=ORANGE if v == 0 else TEXT, weight=BOLD).move_to(np.array([v * scale, y - 0.5, 0])))
        return VGroup(*parts)

    def point(self, v, scale, y, letter, color, up=0.55):
        pos = np.array([v * scale, y, 0])
        return VGroup(cross_at(pos, color), tag(letter, pos, color, fs=34, up=up))

    def construct(self):
        title = Text("Repérage sur une droite graduée", font_size=52, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("Sur une droite graduée, chaque point est repéré par un nombre : son abscisse.", wait=2.2)
        self.play(FadeOut(title), run_time=0.6)

        # ── 1. graduations numérotées ───────────────────────────────────────
        y = -0.6
        g1 = self.graduated(list(range(-4, 5)), set(range(-4, 5)), 1.45, y)
        self.play(Create(g1), run_time=1.2)
        a = self.point(-2, 1.45, y, "A", SKY)
        self.say("Voici un point A. Il est sur la graduation −2 : son abscisse est −2.", FadeIn(a), run_time=0.9, wait=0.6)
        ta = Text(f"A({M}2)", font_size=48, color=SKY, weight=BOLD).move_to(np.array([-3.0, 2.4, 0.0]))
        self.play(FadeIn(ta, shift=UP * 0.2), run_time=0.8)
        self.wait(1.4)
        b = self.point(3, 1.45, y, "B", PINK)
        tb = Text("B(3)", font_size=48, color=PINK, weight=BOLD).move_to(np.array([3.0, 2.4, 0.0]))
        self.say("Le point B est sur la graduation 3 : son abscisse est 3.", FadeIn(b), FadeIn(tb, shift=UP * 0.2), run_time=1.0, wait=1.8)
        self.say("À gauche de 0, les abscisses sont négatives. À droite de 0, elles sont positives.", wait=3.0)
        self.play(*[FadeOut(m) for m in (g1, a, b, ta, tb)], run_time=0.7)

        # ── 2. graduations non toutes numérotées : le pas ───────────────────
        sc = 2.7
        vals = [k / 2 for k in range(-4, 5)]  # −2 … 2, step 0.5
        g2 = self.graduated(vals, {-1, 0}, sc, y)
        self.say("Parfois, toutes les graduations ne sont pas numérotées : il faut trouver le pas.", FadeIn(g2), run_time=1.2, wait=1.4)
        br = Brace(Line(np.array([-1 * sc, y, 0]), np.array([0, y, 0])), DOWN, buff=0.85, color=GREEN)
        br_t = Text("de −1 à 0 : 2 intervalles", font_size=28, color=GREEN, weight=BOLD).next_to(br, DOWN, buff=0.1)
        self.say("Entre −1 et 0, il y a 2 intervalles égaux : chacun vaut 1 ÷ 2 = 0,5. Le pas est 0,5.", FadeIn(br), FadeIn(br_t), run_time=1.2, wait=2.6)
        self.play(FadeOut(br), FadeOut(br_t), run_time=0.5)

        c = self.point(1.5, sc, y, "C", ORANGE, up=1.25)
        self.say("Pour lire l'abscisse de C, on compte les graduations à partir de 0.", FadeIn(c), run_time=0.9, wait=0.6)
        steps = VGroup()
        for k, v in enumerate((0.5, 1.0, 1.5)):
            arrow = Arrow(np.array([(v - 0.5) * sc, y + 0.55, 0]), np.array([v * sc, y + 0.55, 0]), buff=0, color=GREEN, stroke_width=6, max_tip_length_to_length_ratio=0.25)
            lab = Text(fr(v), font_size=26, color=GREEN, weight=BOLD).move_to(np.array([(v - 0.25) * sc, y + 0.95, 0]))
            self.play(Create(arrow), FadeIn(lab), run_time=0.7)
            steps.add(arrow, lab)
        tc = Text("C(1,5)", font_size=48, color=ORANGE, weight=BOLD).move_to(np.array([2.5, 2.4, 0.0]))
        self.say("0,5 ; 1 ; 1,5 : l'abscisse de C est 1,5.", FadeIn(tc, shift=UP * 0.2), run_time=0.9, wait=1.8)
        self.play(FadeOut(steps), run_time=0.5)

        d = self.point(-1.5, sc, y, "D", ROSE, up=1.25)
        td = Text(f"D({M}1,5)", font_size=48, color=ROSE, weight=BOLD).move_to(np.array([-2.5, 2.4, 0.0]))
        self.say("Pour D, on compte vers la gauche : l'abscisse est négative, −1,5.", FadeIn(d), FadeIn(td, shift=UP * 0.2), run_time=1.0, wait=2.2)

        self.say("Pour résumer :", *[FadeOut(m) for m in self.mobjects if m is not self.sub], run_time=0.8, wait=0.6)
        items = [
            ("On repère un point par son abscisse", SKY),
            ("On trouve le pas en comptant les intervalles", GREEN),
            ("À gauche de 0 : négatif ; à droite de 0 : positif", ORANGE),
        ]
        rows = VGroup(*[Text(f"•  {t}", font_size=36, color=c_, weight=BOLD) for t, c_ in items]).arrange(DOWN, aligned_edge=LEFT, buff=0.55)
        rows.scale_to_fit_width(min(rows.width, 12.4))
        rows.move_to(np.array([0.0, 0.5, 0.0]))
        for r in rows:
            self.play(FadeIn(r, shift=RIGHT * 0.4), run_time=0.7)
            self.wait(0.6)
        self.say("À toi de jouer !", wait=2.2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)


# ════════════════════════════════════════════════════════════════════════════
#  3. Comparer et ranger
# ════════════════════════════════════════════════════════════════════════════

class ComparaisonRelatifs(RelBase):
    def pair(self, a, b, eq, why, sub, show_dist=False):
        da, db = Dot(self.p(a), radius=0.14, color=SKY), Dot(self.p(b), radius=0.14, color=PINK)
        la = tag(self.signed(a) if a < 0 else str(a), self.p(a), SKY, up=0.55)
        lb = tag(self.signed(b) if b < 0 else str(b), self.p(b), PINK, up=0.55)
        eq_t = Text(eq, font_size=56, color=TEXT, weight=BOLD).move_to(np.array([0.0, 3.0, 0.0]))
        why_t = Text(why, font_size=30, color=ORANGE).move_to(np.array([0.0, 2.15, 0.0]))
        extra = VGroup()
        self.say(sub)
        self.play(FadeIn(da), FadeIn(db), FadeIn(la), FadeIn(lb), run_time=0.9)
        self.play(FadeIn(eq_t, shift=UP * 0.2), FadeIn(why_t), run_time=0.9)
        if show_dist:
            for v, col, lvl in ((a, SKY, 0), (b, PINK, 1)):
                arr = Arrow(self.p(0, 1.15 + 0.5 * lvl), self.p(v, 1.15 + 0.5 * lvl), buff=0, color=col, stroke_width=5, max_tip_length_to_length_ratio=0.12)
                t = Text(f"distance à 0 : {abs(v)}", font_size=24, color=col, weight=BOLD).move_to((self.p(0, 1.15 + 0.5 * lvl) + self.p(v, 1.15 + 0.5 * lvl)) / 2 + UP * 0.3)
                extra.add(arr, t)
            self.play(Create(extra), run_time=1.2)
        self.wait(2.2)
        self.play(*[FadeOut(m) for m in (da, db, la, lb, eq_t, why_t, extra)], run_time=0.6)

    def construct(self):
        title = Text("Comparer et ranger des nombres relatifs", font_size=46, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("Sur la droite graduée, le plus grand nombre est celui qui est le plus à droite.", wait=2.4)
        self.play(FadeOut(title), run_time=0.6)

        ax = self.axis()
        self.play(Create(ax), run_time=1.2)
        lt = VGroup(Text("<", font_size=44, color=GREEN, weight=BOLD), Text("« est inférieur à »", font_size=30, color=TEXT)).arrange(RIGHT, buff=0.3).move_to(np.array([-3.4, 3.1, 0.0]))
        gt = VGroup(Text(">", font_size=44, color=ROSE, weight=BOLD), Text("« est supérieur à »", font_size=30, color=TEXT)).arrange(RIGHT, buff=0.3).move_to(np.array([3.4, 3.1, 0.0]))
        self.say("Le signe < se lit « est inférieur à », le signe > se lit « est supérieur à ».", FadeIn(lt), FadeIn(gt), run_time=1.0, wait=2.4)
        self.play(FadeOut(lt), FadeOut(gt), run_time=0.5)

        self.pair(3, 5, "3 < 5", "deux positifs : le plus grand est le plus loin de zéro",
                  "Deux nombres positifs : le plus grand est celui qui a la plus grande distance à zéro.")
        self.pair(-2, 4, f"{M}2 < 4", "un négatif est toujours plus petit qu'un positif",
                  "Un nombre positif et un nombre négatif : le plus grand est toujours le positif.")
        self.pair(-7, -3, f"{M}7 < {M}3", "−3 est plus proche de 0 : il est plus grand",
                  "Deux nombres négatifs : le plus grand est celui qui est le plus proche de zéro.", show_dist=True)

        # ── ranger ──────────────────────────────────────────────────────────
        self.play(FadeOut(ax), run_time=0.6)
        nums = [3, -5, 0, -1]
        label = lambda v: M + str(abs(v)) if v < 0 else str(v)
        xs = [-4.5, -1.5, 1.5, 4.5]
        pieces = {v: Text(label(v), font_size=64, color=c, weight=BOLD) for v, c in zip(nums, (SKY, ROSE, ORANGE, GREEN))}
        for v, x in zip(nums, xs):
            pieces[v].move_to(np.array([x, 1.2, 0.0]))
        self.say("Ranger des nombres, c'est les écrire dans un certain ordre.", *[FadeIn(pieces[v]) for v in nums], run_time=1.0, wait=1.4)

        inc = sorted(nums)
        self.say("Ordre croissant : du plus petit au plus grand.",
                 *[pieces[v].animate.move_to(np.array([xs[k], 1.2, 0.0])) for k, v in enumerate(inc)], run_time=1.8, wait=0.8)
        inc_t = Text(f"{M}5  <  {M}1  <  0  <  3", font_size=52, color=GREEN, weight=BOLD).move_to(np.array([0.0, -0.3, 0.0]))
        self.play(FadeIn(inc_t, shift=UP * 0.2), run_time=0.8)
        self.wait(2.0)

        dec = sorted(nums, reverse=True)
        self.say("Ordre décroissant : du plus grand au plus petit.",
                 *[pieces[v].animate.move_to(np.array([xs[k], 1.2, 0.0])) for k, v in enumerate(dec)], FadeOut(inc_t), run_time=1.8, wait=0.8)
        dec_t = Text(f"3  >  0  >  {M}1  >  {M}5", font_size=52, color=ROSE, weight=BOLD).move_to(np.array([0.0, -0.3, 0.0]))
        self.play(FadeIn(dec_t, shift=UP * 0.2), run_time=0.8)
        self.wait(2.0)

        self.say("Pour résumer :", *[FadeOut(m) for m in self.mobjects if m is not self.sub], run_time=0.8, wait=0.6)
        items = [
            ("Deux positifs : le plus loin de 0 est le plus grand", GREEN),
            ("Positif et négatif : le positif est le plus grand", ORANGE),
            ("Deux négatifs : le plus proche de 0 est le plus grand", ROSE),
        ]
        rows = VGroup(*[Text(f"•  {t}", font_size=34, color=c_, weight=BOLD) for t, c_ in items]).arrange(DOWN, aligned_edge=LEFT, buff=0.55)
        rows.scale_to_fit_width(min(rows.width, 12.4))
        rows.move_to(np.array([0.0, 0.5, 0.0]))
        for r in rows:
            self.play(FadeIn(r, shift=RIGHT * 0.4), run_time=0.7)
            self.wait(0.6)
        self.say("À toi de jouer !", wait=2.2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)


# ════════════════════════════════════════════════════════════════════════════
#  4. Repérage dans un repère
# ════════════════════════════════════════════════════════════════════════════

class ReperageRepere(RelBase):
    U = 0.55
    C0 = np.array([-2.9, 0.5, 0.0])

    def P(self, x, y):
        return self.C0 + np.array([x * self.U, y * self.U, 0.0])

    def construct(self):
        title = Text("Repérage dans un repère", font_size=56, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("Dans un plan, un point se repère avec deux nombres : ses coordonnées.", wait=2.2)
        self.play(FadeOut(title), run_time=0.6)

        grid = VGroup(
            *[Line(self.P(i, -5.3), self.P(i, 5.3), color="#2B3040", stroke_width=1.5) for i in range(-5, 6)],
            *[Line(self.P(-5.3, j), self.P(5.3, j), color="#2B3040", stroke_width=1.5) for j in range(-5, 6)],
        )
        xaxis = Arrow(self.P(-5.5, 0), self.P(5.7, 0), buff=0, color=TEXT, stroke_width=4, max_tip_length_to_length_ratio=0.05)
        yaxis = Arrow(self.P(0, -5.5), self.P(0, 5.7), buff=0, color=TEXT, stroke_width=4, max_tip_length_to_length_ratio=0.05)
        nums = VGroup()
        for i in range(-5, 6):
            if i == 0:
                continue
            lab = (M if i < 0 else "") + str(abs(i))
            nums.add(Text(lab, font_size=15, color="#9CA3AF").move_to(self.P(i, 0) + DOWN * 0.22))
            nums.add(Text(lab, font_size=15, color="#9CA3AF").move_to(self.P(0, i) + LEFT * 0.28))
        o_dot = Dot(self.P(0, 0), radius=0.07, color=ORANGE)
        o_lab = Text("O", font_size=26, color=ORANGE, weight=BOLD).move_to(self.P(0, 0) + UR * 0.3)

        self.say("Un repère du plan est formé de deux droites graduées qui se coupent en un point : l'origine O.",
                 FadeIn(grid), Create(xaxis), Create(yaxis), FadeIn(nums), FadeIn(o_dot), FadeIn(o_lab), run_time=1.8, wait=1.4)

        panel_x = 3.4
        hx = xaxis.copy().set_color(SKY).set_stroke(width=7)
        tx = Text("axe des abscisses", font_size=34, color=SKY, weight=BOLD).move_to(np.array([panel_x, 2.4, 0.0]))
        self.say("La droite horizontale est l'axe des abscisses.", Create(hx), FadeIn(tx), run_time=1.0, wait=1.6)
        hy = yaxis.copy().set_color(GREEN).set_stroke(width=7)
        ty = Text("axe des ordonnées", font_size=34, color=GREEN, weight=BOLD).move_to(np.array([panel_x, 1.6, 0.0]))
        self.say("La droite verticale est l'axe des ordonnées.", Create(hy), FadeIn(ty), run_time=1.0, wait=1.6)
        self.play(FadeOut(hx), FadeOut(hy), FadeOut(tx), FadeOut(ty), run_time=0.5)

        # ── A(4 ; 2) ────────────────────────────────────────────────────────
        A = self.P(4, 2)
        a_cross = cross_at(A, ORANGE)
        a_lab = Text("A", font_size=30, color=ORANGE, weight=BOLD).move_to(A + UR * 0.3)
        self.say("Pour repérer le point A, on lit d'abord son abscisse.", FadeIn(a_cross), FadeIn(a_lab), run_time=0.8, wait=0.6)
        vline = DashedLine(A, self.P(4, 0), color=ROSE, stroke_width=4, dash_length=0.12)
        vmark = Dot(self.P(4, 0), radius=0.09, color=ROSE)
        t_abs = Text("abscisse : 4", font_size=36, color=ROSE, weight=BOLD).move_to(np.array([panel_x, 2.2, 0.0]))
        self.say("On descend sur l'axe horizontal : l'abscisse de A est 4.", Create(vline), FadeIn(vmark), FadeIn(t_abs), run_time=1.2, wait=1.6)
        hline = DashedLine(A, self.P(0, 2), color=GREEN, stroke_width=4, dash_length=0.12)
        hmark = Dot(self.P(0, 2), radius=0.09, color=GREEN)
        t_ord = Text("ordonnée : 2", font_size=36, color=GREEN, weight=BOLD).move_to(np.array([panel_x, 1.4, 0.0]))
        self.say("Puis son ordonnée : on va vers l'axe vertical, l'ordonnée de A est 2.", Create(hline), FadeIn(hmark), FadeIn(t_ord), run_time=1.2, wait=1.8)
        t_co = Text("A(4 ; 2)", font_size=62, color=ORANGE, weight=BOLD).move_to(np.array([panel_x, 0.2, 0.0]))
        t_rule = Text("l'abscisse toujours en premier", font_size=28, color=TEXT).move_to(np.array([panel_x, -0.7, 0.0]))
        self.say("On écrit les coordonnées de A : A(4 ; 2). On note toujours l'abscisse en premier.", FadeIn(t_co, scale=1.2), FadeIn(t_rule), run_time=1.0, wait=2.4)

        # ── B(−3 ; −2) ──────────────────────────────────────────────────────
        self.play(*[FadeOut(m) for m in (a_cross, a_lab, vline, vmark, hline, hmark, t_abs, t_ord, t_co, t_rule)], run_time=0.7)
        B = self.P(-3, -2)
        b_cross = cross_at(B, PINK)
        b_lab = Text("B", font_size=30, color=PINK, weight=BOLD).move_to(B + DL * 0.3)
        bv = DashedLine(B, self.P(-3, 0), color=ROSE, stroke_width=4, dash_length=0.12)
        bh = DashedLine(B, self.P(0, -2), color=GREEN, stroke_width=4, dash_length=0.12)
        t_b = Text(f"B({M}3 ; {M}2)", font_size=58, color=PINK, weight=BOLD).move_to(np.array([panel_x, 1.5, 0.0]))
        t_b2 = Text(f"abscisse {M}3,  ordonnée {M}2", font_size=28, color=TEXT).move_to(np.array([panel_x, 0.6, 0.0]))
        self.say("Un autre exemple : le point B est à gauche de l'axe vertical et en dessous de l'axe horizontal.",
                 FadeIn(b_cross), FadeIn(b_lab), run_time=1.0, wait=1.0)
        self.say("Son abscisse est −3 et son ordonnée est −2 : B(−3 ; −2).",
                 Create(bv), Create(bh), FadeIn(t_b, scale=1.2), FadeIn(t_b2), run_time=1.4, wait=2.6)

        self.say("Pour résumer :", *[FadeOut(m) for m in self.mobjects if m is not self.sub], run_time=0.8, wait=0.6)
        items = [
            ("Deux axes graduées qui se coupent en O", SKY),
            ("Axe des abscisses (horizontal), axe des ordonnées (vertical)", GREEN),
            ("Coordonnées : (abscisse ; ordonnée)", ORANGE),
        ]
        rows = VGroup(*[Text(f"•  {t}", font_size=34, color=c_, weight=BOLD) for t, c_ in items]).arrange(DOWN, aligned_edge=LEFT, buff=0.55)
        rows.scale_to_fit_width(min(rows.width, 12.4))
        rows.move_to(np.array([0.0, 0.5, 0.0]))
        for r in rows:
            self.play(FadeIn(r, shift=RIGHT * 0.4), run_time=0.7)
            self.wait(0.6)
        self.say("À toi de jouer !", wait=2.2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)
