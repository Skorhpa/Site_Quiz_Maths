# Source of public/videos/relatifs-addition.mp4, relatifs-soustraction.mp4, relatifs-ecriture.mp4 (Manim Community). Needs construction.py in the same folder.
# Render:  python -m manim render -r 1280,720 --fps 30 relatifs.py AdditionRelatifs   (also SoustractionRelatifs, EcritureRelatifs; then copy the .mp4 files into public/videos/)

from manim import *
import numpy as np

from construction import (  # shared subtitle scene + palette (same folder)
    Subtitled, unit, SKY, PINK, ORANGE, GREEN, VIOLET, ROSE, TEXT,
)

M = "−"  # true minus sign


class RelBase(Subtitled):
    """Helpers shared by the three videos on relative numbers."""

    def row(self, parts, y, fs=44, colors=None, buff=0.22):
        """A line of separate Text pieces (so each piece can be transformed / coloured on its own)."""
        pieces = [Text(p, font_size=fs, color=(colors[i] if colors and colors[i] else TEXT), weight=BOLD) for i, p in enumerate(parts)]
        grp = VGroup(*pieces).arrange(RIGHT, buff=buff)
        if grp.width > 12.6:
            grp.scale_to_fit_width(12.6)
        grp.move_to(np.array([0.0, y, 0.0]))
        return grp

    # ── number line (no LaTeX: ticks and labels drawn by hand) ──────────────
    STEP = 0.8
    Y0 = -0.9

    def p(self, n, level=0.0):
        return np.array([n * self.STEP, self.Y0 + level, 0.0])

    def axis(self):
        parts = [Line(self.p(-8.4), self.p(8.4), color="#6B7280", stroke_width=4)]
        for n in range(-8, 9):
            parts.append(Line(self.p(n) + DOWN * 0.12, self.p(n) + UP * 0.12, color="#6B7280", stroke_width=3))
            lab = (M if n < 0 else "") + str(abs(n))
            col = ORANGE if n == 0 else "#9CA3AF"
            parts.append(Text(lab, font_size=20, color=col, weight=BOLD if n == 0 else NORMAL).move_to(self.p(n) + DOWN * 0.42))
        return VGroup(*parts)

    def jump(self, a, b, level, color, label):
        y = 0.6 + 0.55 * level
        pa, pb = self.p(a, y), self.p(b, y)
        arrow = Arrow(pa, pb, buff=0, color=color, stroke_width=7, max_tip_length_to_length_ratio=0.22)
        drop = DashedLine(self.p(a), pa, color=color, stroke_width=2, dash_length=0.1)
        txt = Text(label, font_size=30, color=color, weight=BOLD).move_to((pa + pb) / 2 + UP * 0.32)
        return VGroup(drop, arrow), txt

    def signed(self, v):
        return ("+" if v > 0 else M if v < 0 else "") + str(abs(v))

    def case(self, a, b, eq, why, sub, wait=None):
        """a + b on the number line: first jump from 0 to a, then from a to a + b."""
        r = a + b
        j1, l1 = self.jump(0, a, 0, SKY if a > 0 else ROSE, self.signed(a))
        j2, l2 = self.jump(a, r, 1, SKY if b > 0 else ROSE, self.signed(b))
        start = Dot(self.p(0), radius=0.1, color=ORANGE)
        end = Dot(self.p(r), radius=0.14, color=GREEN)
        eq_t = Text(eq, font_size=46, color=TEXT, weight=BOLD).move_to(np.array([0.0, 3.1, 0.0]))
        why_t = Text(why, font_size=30, color=ORANGE).move_to(np.array([0.0, 2.3, 0.0]))
        self.say(sub)
        self.play(FadeIn(start), FadeIn(eq_t, shift=UP * 0.2), run_time=0.7)
        self.play(Create(j1), FadeIn(l1), run_time=1.1)
        self.play(Create(j2), FadeIn(l2), run_time=1.1)
        self.play(FadeIn(end, scale=2), FadeIn(why_t), run_time=0.9)
        self.wait(wait if wait is not None else 2.0)
        self.play(*[FadeOut(m) for m in (j1, l1, j2, l2, start, end, eq_t, why_t)], run_time=0.6)


# ════════════════════════════════════════════════════════════════════════════
#  1. Additionner des nombres relatifs
# ════════════════════════════════════════════════════════════════════════════

class AdditionRelatifs(RelBase):
    def construct(self):
        title = Text("Additionner des nombres relatifs", font_size=52, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("Pour additionner, on utilise la distance à zéro et le signe de chaque nombre.", wait=2.0)
        self.play(FadeOut(title), run_time=0.6)

        # ── La notation avec parenthèses ────────────────────────────────────
        bad = self.row(["+3", "+", M + "1"], 0.6, fs=76)
        cross = Cross(bad, stroke_color=ROSE, stroke_width=8)
        self.say("On ne peut pas écrire +3 + −1 : les deux signes se touchent.", FadeIn(bad), run_time=0.8, wait=1.2)
        self.play(Create(cross), run_time=0.7)
        self.wait(0.8)
        good = self.row(["(", "+", "3", ")", "+", "(", M, "1", ")"], 0.6, fs=76, buff=0.1,
                        colors=[None, ORANGE, None, None, SKY, None, ROSE, None, None])
        self.say("On sépare les signes avec des parenthèses : (+3) + (−1).",
                 FadeOut(bad), FadeOut(cross), FadeIn(good), run_time=1.0, wait=1.2)
        cap1 = Text("signe de 3", font_size=28, color=ORANGE).next_to(good[1], DOWN, buff=1.0)
        cap2 = Text("addition", font_size=28, color=SKY).next_to(good[4], UP, buff=1.0)
        a1 = Arrow(cap1.get_top(), good[1].get_bottom(), buff=0.1, color=ORANGE, stroke_width=4)
        a2 = Arrow(cap2.get_bottom(), good[4].get_top(), buff=0.1, color=SKY, stroke_width=4)
        self.say("Le signe + a deux rôles : donner le signe de 3, et dire qu'on additionne.",
                 FadeIn(cap1), FadeIn(cap2), Create(a1), Create(a2), run_time=1.2, wait=2.2)
        self.play(*[FadeOut(m) for m in (good, cap1, cap2, a1, a2)], run_time=0.7)

        # ── Sur la droite graduée ───────────────────────────────────────────
        ax = self.axis()
        self.play(Create(ax), run_time=1.2)

        self.case(2, 4, "(+2) + (+4) = +6", "2 + 4 = 6  →  signe +",
                  "Même signe : on garde ce signe et on ajoute les distances à zéro.")
        self.case(-3, -1, f"({M}3) + ({M}1) = {M}4", f"3 + 1 = 4  →  signe {M}",
                  "Même signe, négatif : on ajoute les distances (3 + 1) et on garde le signe −.")
        self.case(-5, 3, f"({M}5) + (+3) = {M}2", f"5 > 3, donc signe {M}  ;  5 {M} 3 = 2",
                  "Signes contraires : on prend le signe de la plus grande distance à zéro, et on soustrait les distances.", wait=2.4)
        self.case(-2, 7, f"({M}2) + (+7) = +5", f"7 > 2, donc signe +  ;  7 {M} 2 = 5",
                  "Ici la plus grande distance est celle de +7 : le résultat est positif.", wait=2.4)
        self.case(4, -4, f"(+4) + ({M}4) = 0", f"4 {M} 4 = 0",
                  "Deux nombres opposés ont toujours une somme égale à 0.", wait=2.2)

        # ── Récapitulatif ───────────────────────────────────────────────────
        self.say("Pour résumer :", *[FadeOut(m) for m in self.mobjects if m is not self.sub], run_time=0.8, wait=0.6)
        items = [
            ("Même signe : on garde le signe, on ADDITIONNE les distances", GREEN),
            ("Signes contraires : signe de la plus grande distance, on SOUSTRAIT", ORANGE),
            ("Deux nombres opposés : la somme vaut 0", VIOLET),
        ]
        rows = VGroup(*[Text(f"•  {t}", font_size=34, color=c, weight=BOLD) for t, c in items]).arrange(DOWN, aligned_edge=LEFT, buff=0.55)
        if rows.width > 12.6:
            rows.scale_to_fit_width(12.6)
        rows.move_to(np.array([0.0, 0.4, 0.0]))
        for r in rows:
            self.play(FadeIn(r, shift=RIGHT * 0.4), run_time=0.8)
            self.wait(0.7)
        self.say("À toi de jouer !", wait=2.2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)


# ════════════════════════════════════════════════════════════════════════════
#  2. Soustraire des nombres relatifs
# ════════════════════════════════════════════════════════════════════════════

class SoustractionRelatifs(RelBase):
    def example(self, name, a, b, sub_pick, sub_swap, sub_calc, final, why):
        """name = (a) − (b)  →  name = (a) + (−b)  →  result."""
        opp = lambda s: ("(" + M + s[2:] if s[1] == "+" else "(+" + s[2:])  # "(+3)" -> "(−3)" ; "(−6)" -> "(+6)"
        l1 = self.row([f"{name} =", a, M, b], 1.6, fs=56)
        self.say(sub_pick, FadeIn(l1), run_time=0.9, wait=0.4)
        box = SurroundingRectangle(l1[3], color=ORANGE, buff=0.12, stroke_width=5)
        self.play(Create(box), run_time=0.6)
        self.wait(0.8)
        l2 = self.row([f"{name} =", a, "+", opp(b)], 0.2, fs=56, colors=[None, None, GREEN, GREEN])
        self.say(sub_swap, *[TransformFromCopy(l1[i], l2[i]) for i in range(4)], run_time=1.6, wait=0.6)
        sw = SurroundingRectangle(VGroup(l2[2], l2[3]), color=GREEN, buff=0.12, stroke_width=5)
        self.play(ReplacementTransform(box, sw), run_time=0.6)
        self.wait(1.0)
        l3 = Text(f"{name} = {final}", font_size=56, color=TEXT, weight=BOLD).move_to(np.array([0.0, -1.2, 0.0]))
        wy = Text(why, font_size=30, color=ORANGE).move_to(np.array([0.0, -2.1, 0.0]))
        self.say(sub_calc, FadeIn(l3, shift=UP * 0.2), FadeIn(wy), run_time=1.0, wait=1.8)
        self.play(*[FadeOut(m) for m in (l1, l2, l3, wy, sw)], run_time=0.6)

    def construct(self):
        title = Text("Soustraire des nombres relatifs", font_size=52, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("Une idée suffit pour toutes les soustractions.", wait=1.6)
        self.play(FadeOut(title), run_time=0.6)

        rule = VGroup(
            Text("Soustraire un nombre relatif,", font_size=46, color=TEXT, weight=BOLD),
            Text("c'est additionner son opposé.", font_size=46, color=ORANGE, weight=BOLD),
        ).arrange(DOWN, buff=0.3).move_to(np.array([0.0, 0.8, 0.0]))
        self.say("Soustraire un nombre relatif, c'est additionner son opposé.", FadeIn(rule), run_time=1.2, wait=2.4)
        opp = VGroup(
            Text("L'opposé de +3, c'est −3.", font_size=34, color=SKY),
            Text("L'opposé de −6, c'est +6.", font_size=34, color=ROSE),
        ).arrange(DOWN, buff=0.25).move_to(np.array([0.0, -1.5, 0.0]))
        self.say("Rappel : l'opposé d'un nombre a le même nombre après le signe, mais le signe contraire.",
                 FadeIn(opp), run_time=1.0, wait=1.8)
        self.play(FadeOut(rule), FadeOut(opp), run_time=0.7)

        self.example("A", "(+7)", "(+3)",
                     "Exemple A : on repère le nombre qui est soustrait, (+3).",
                     "On le remplace par son opposé (−3), et le « − » devient un « + ».",
                     "Maintenant c'est une addition. Signes contraires : 7 − 3 = 4, et on garde le signe +.",
                     "+4", f"7 {M} 3 = 4")
        self.example("B", f"({M}8)", f"({M}6)",
                     "Exemple B : le nombre soustrait est (−6).",
                     "Son opposé est (+6), et le « − » devient un « + ».",
                     "Signes contraires : 8 − 6 = 2, avec le signe de la plus grande distance : −.",
                     f"{M}2", f"8 {M} 6 = 2")
        self.example("C", f"({M}5)", "(+3)",
                     "Exemple C : le nombre soustrait est (+3).",
                     "Son opposé est (−3), et le « − » devient un « + ».",
                     "Même signe : on ajoute les distances, 5 + 3 = 8, et on garde le signe −.",
                     f"{M}8", f"5 + 3 = 8")

        self.say("Pour résumer :", wait=0.6)
        recap = VGroup(
            Text(f"(+7) {M} (+3)  =  (+7) + ({M}3)  =  +4", font_size=36, color=SKY, weight=BOLD),
            Text(f"({M}8) {M} ({M}6)  =  ({M}8) + (+6)  =  {M}2", font_size=36, color=ORANGE, weight=BOLD),
            Text(f"({M}5) {M} (+3)  =  ({M}5) + ({M}3)  =  {M}8", font_size=36, color=GREEN, weight=BOLD),
        ).arrange(DOWN, buff=0.5).move_to(np.array([0.0, 0.5, 0.0]))
        for r in recap:
            self.play(FadeIn(r, shift=RIGHT * 0.4), run_time=0.8)
            self.wait(0.6)
        self.say("Soustraire, c'est ajouter l'opposé.", wait=3.0)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)


# ════════════════════════════════════════════════════════════════════════════
#  3. Simplifier l'écriture
# ════════════════════════════════════════════════════════════════════════════

class EcritureRelatifs(RelBase):
    def construct(self):
        title = Text("Simplifier l'écriture", font_size=56, color=TEXT, weight=BOLD)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=1.0)
        self.say("On peut écrire une somme de nombres relatifs beaucoup plus simplement.", wait=2.0)
        self.play(FadeOut(title), run_time=0.6)

        # ── Premier exemple ─────────────────────────────────────────────────
        self.chain([f"(+3) {M} (+5)", f"(+3) + ({M}5)", f"3 + ({M}5)", f"3 {M} 5"],
                   ["On commence par une soustraction : on ajoute l'opposé de (+5).",
                    "On supprime la parenthèse autour de (+3) : on écrit simplement 3.",
                    "« + » suivi d'un « − » donne un « − » : on écrit 3 − 5."])
        # ── Second exemple ──────────────────────────────────────────────────
        self.chain([f"(+12) {M} ({M}8)", "(+12) + (+8)", "12 + (+8)", "12 + 8"],
                   ["Deuxième exemple : on ajoute l'opposé de (−8), c'est (+8).",
                    "On supprime la parenthèse autour de (+12).",
                    "« + » suivi d'un « + » donne un « + » : on écrit 12 + 8."])

        # ── Les quatre règles ───────────────────────────────────────────────
        self.say("Voici les quatre règles à retenir.")
        cards = []
        spec = [("+  suivi de  +", "+", GREEN), ("+  suivi de  " + M, M, ROSE),
                (M + "  suivi de  +", M, ORANGE), (M + "  suivi de  " + M, "+", VIOLET)]
        for k, (label, res, col) in enumerate(spec):
            box = RoundedRectangle(width=5.6, height=1.5, corner_radius=0.2, color=col, stroke_width=4, fill_color=col, fill_opacity=0.12)
            t = Text(f"{label}   donne   {res}", font_size=32, color=TEXT, weight=BOLD).move_to(box)
            g = VGroup(box, t)
            g.move_to(np.array([(-3.2 if k % 2 == 0 else 3.2), (1.3 if k < 2 else -0.5), 0.0]))
            cards.append(g)
        for g in cards:
            self.play(FadeIn(g, shift=UP * 0.2), run_time=0.7)
            self.wait(0.5)
        self.say("Mêmes signes : on obtient « + ». Signes différents : on obtient « − ».", wait=3.2)
        self.play(*[FadeOut(g) for g in cards], run_time=0.7)

        # ── Un exemple plus long ────────────────────────────────────────────
        S = f"S = ({M}9) {M} (+7) {M} ({M}3) + ({M}7) + (+6) {M} (+5) + (+8)"
        s2 = f"S = {M}9 {M} 7 + 3 {M} 7 + 6 {M} 5 + 8"
        l1 = Text(S, font_size=34, color=TEXT, weight=BOLD)
        l1.scale_to_fit_width(min(l1.width, 12.6))
        l1.move_to(np.array([0.0, 2.2, 0.0]))
        self.say("Simplifions cette expression, terme par terme.", FadeIn(l1), run_time=1.0, wait=1.4)
        l2 = Text(s2, font_size=44, color=GREEN, weight=BOLD).move_to(np.array([0.0, 0.9, 0.0]))
        self.say("On applique les règles à chaque signe, et on supprime les parenthèses.", FadeIn(l2, shift=UP * 0.2), run_time=1.2, wait=2.2)
        l3 = Text(f"termes positifs : 3 + 6 + 8 = 17", font_size=36, color=SKY, weight=BOLD).move_to(np.array([0.0, -0.3, 0.0]))
        l4 = Text(f"termes négatifs : {M}9 {M} 7 {M} 7 {M} 5 = {M}28", font_size=36, color=ROSE, weight=BOLD).move_to(np.array([0.0, -1.2, 0.0]))
        self.say("On regroupe les termes de même signe.", FadeIn(l3), FadeIn(l4), run_time=1.2, wait=2.2)
        l5 = Text(f"S = 17 {M} 28 = {M}11", font_size=54, color=ORANGE, weight=BOLD).move_to(np.array([0.0, -2.3, 0.0]))
        self.say("Il ne reste qu'un calcul : 17 − 28 = −11.", FadeIn(l5, scale=1.2), run_time=1.0, wait=2.6)
        self.say("On simplifie, puis on regroupe les termes de même signe.", wait=3.0)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.0)

    def chain(self, lines, subs):
        """Successive equalities, each one appearing under the previous one."""
        ys = [2.0, 0.7, -0.6, -1.9]
        made = []
        first = Text(lines[0], font_size=54, color=TEXT, weight=BOLD).move_to(np.array([0.0, ys[0], 0.0]))
        self.say("On part de :", FadeIn(first), run_time=0.9, wait=0.8)
        made.append(first)
        for k in range(1, len(lines)):
            t = Text("=  " + lines[k], font_size=54, color=GREEN if k == len(lines) - 1 else TEXT, weight=BOLD).move_to(np.array([0.0, ys[k], 0.0]))
            self.say(subs[k - 1], FadeIn(t, shift=DOWN * 0.15), run_time=0.9, wait=1.6)
            made.append(t)
        self.wait(0.8)
        self.play(*[FadeOut(m) for m in made], run_time=0.6)
