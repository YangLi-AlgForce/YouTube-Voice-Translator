"""
Generate an editable PowerPoint with 4 grouped bar charts matching the research figure.
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.chart import XL_CHART_TYPE
from pptx.dml.color import RGBColor
from pptx.chart.data import ChartData
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
import copy

# ── colour palette ──────────────────────────────────────────────────────────
BLUE   = RGBColor(0x88, 0xC0, 0xD8)   # non-sycophantic
ORANGE = RGBColor(0xE0, 0x9A, 0x3A)   # sycophantic

# ── data (mean values read from the figure) ─────────────────────────────────
# Each sub-chart: [(study_label, non_syco_mean, syco_mean, diff, pct), ...]
charts_data = [
    {
        "title": "a.  Response quality",
        "series": [
            ("Study 2", 4.92, 5.34),
            ("Study 3", 5.32, 5.78),
        ],
        "annotations": ["+0.42(+9%)", "+0.46 (9%)"],
        "y_min": 2, "y_max": 6,
    },
    {
        "title": "b.  Return likelihood",
        "series": [
            ("Study 2", 4.27, 4.81),
            ("Study 3", 4.73, 5.34),
        ],
        "annotations": ["+0.54(+13%)", "+0.61 (+13%)"],
        "y_min": 2, "y_max": 6,
    },
    {
        "title": "c.  Performance trust",
        "series": [
            ("Study 2", 4.68, 4.95),
            ("Study 3", 5.27, 5.70),
        ],
        "annotations": ["+0.27(+6%)", "+0.43 (+8%)"],
        "y_min": 2, "y_max": 6,
    },
    {
        "title": "d.  Moral trust",
        "series": [
            ("Study 2", 4.57, 4.86),
            ("Study 3", 5.13, 5.58),
        ],
        "annotations": ["+0.29(+6%)", "+0.45 (+9%)"],
        "y_min": 2, "y_max": 6,
    },
]

# sample sizes shown in bars
N_LABELS = [
    [("n = 408", "n = 396"), ("n = 400", "n = 400")],  # chart a
    [("n = 408", "n = 396"), ("n = 400", "n = 400")],  # chart b
    [("n = 408", "n = 396"), ("n = 400", "n = 400")],  # chart c
    [("n = 408", "n = 396"), ("n = 400", "n = 400")],  # chart d
]

# ── slide layout ─────────────────────────────────────────────────────────────
SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

slide_layout = prs.slide_layouts[6]   # blank
slide = prs.slides.add_slide(slide_layout)

# ── helper: add a grouped bar chart ─────────────────────────────────────────
def add_grouped_bar_chart(slide, title, series_data, left, top, width, height,
                          y_min=2, y_max=6):
    """Add one grouped-bar chart to the slide, return the chart object."""
    chart_data = ChartData()

    categories = [s[0] for s in series_data]   # ["Study 2", "Study 3"]
    chart_data.categories = categories

    non_syco_vals = [s[1] for s in series_data]
    syco_vals     = [s[2] for s in series_data]

    chart_data.add_series("non-sycophantic AI model", non_syco_vals)
    chart_data.add_series("sycophantic AI model",     syco_vals)

    chart_frame = slide.shapes.add_chart(
        XL_CHART_TYPE.BAR_CLUSTERED,   # will be overridden to column below
        left, top, width, height,
        chart_data,
    )

    # python-pptx adds BAR (horizontal) by default for BAR_CLUSTERED;
    # we need COLUMN_CLUSTERED (vertical). Patch the XML type attribute.
    from lxml import etree
    c_elem = chart_frame.chart._element
    # barChart → change to column by setting barDir to "col"
    for barChart in c_elem.iter("{http://schemas.openxmlformats.org/drawingml/2006/chart}barChart"):
        for barDir in barChart.iter("{http://schemas.openxmlformats.org/drawingml/2006/chart}barDir"):
            barDir.set("val", "col")

    chart = chart_frame.chart

    # ── value axis (Y) ──────────────────────────────────────────────────────
    val_axis = chart.value_axis
    val_axis.minimum_scale = y_min
    val_axis.maximum_scale = y_max
    val_axis.major_unit    = 1
    val_axis.has_major_gridlines = True
    val_axis.tick_labels.font.size = Pt(9)
    val_axis.tick_labels.font.color.rgb = RGBColor(0x60, 0x60, 0x60)

    # axis title "Mean (1-7)"
    val_axis.axis_title.text_frame.text = "Mean (1-7)"
    val_axis.axis_title.text_frame.paragraphs[0].font.size = Pt(9)
    val_axis.axis_title.text_frame.paragraphs[0].font.bold = False
    val_axis.axis_title.text_frame.paragraphs[0].font.color.rgb = RGBColor(0x40,0x40,0x40)
    val_axis.axis_title.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # ── category axis (X) ───────────────────────────────────────────────────
    cat_axis = chart.category_axis
    cat_axis.tick_labels.font.size = Pt(10)
    cat_axis.has_major_gridlines   = False

    # ── series colours ───────────────────────────────────────────────────────
    series0 = chart.series[0]   # non-sycophantic → blue
    series1 = chart.series[1]   # sycophantic     → orange

    for pt_idx in range(len(series_data)):
        series0.points[pt_idx].format.fill.solid()
        series0.points[pt_idx].format.fill.fore_color.rgb = BLUE
        series1.points[pt_idx].format.fill.solid()
        series1.points[pt_idx].format.fill.fore_color.rgb = ORANGE

    # overall series fill as fallback
    series0.format.fill.solid()
    series0.format.fill.fore_color.rgb = BLUE
    series1.format.fill.solid()
    series1.format.fill.fore_color.rgb = ORANGE

    # ── chart title ──────────────────────────────────────────────────────────
    chart.has_title = True
    chart.chart_title.text_frame.text = title
    chart.chart_title.text_frame.paragraphs[0].font.bold  = True
    chart.chart_title.text_frame.paragraphs[0].font.size  = Pt(11)
    chart.chart_title.text_frame.paragraphs[0].font.color.rgb = RGBColor(0x20,0x20,0x20)

    # ── hide legend (we'll use a shared slide-level legend) ──────────────────
    chart.has_legend = False

    # ── chart area background white ──────────────────────────────────────────
    chart_frame.chart._element  # just ensure element is present

    return chart_frame


# ── chart positions (2 × 2 grid) ─────────────────────────────────────────────
MARGIN_L  = Inches(0.6)
MARGIN_T  = Inches(0.9)   # leave room for shared legend at top
GAP_X     = Inches(0.3)
GAP_Y     = Inches(0.3)
CH_W      = (SLIDE_W - MARGIN_L - Inches(0.4) - GAP_X) / 2
CH_H      = (SLIDE_H - MARGIN_T - Inches(0.3) - GAP_Y) / 2

positions = [
    (MARGIN_L,          MARGIN_T),           # a – top-left
    (MARGIN_L + CH_W + GAP_X, MARGIN_T),     # b – top-right
    (MARGIN_L,          MARGIN_T + CH_H + GAP_Y),   # c – bottom-left
    (MARGIN_L + CH_W + GAP_X, MARGIN_T + CH_H + GAP_Y),  # d – bottom-right
]

for i, (cd, pos) in enumerate(zip(charts_data, positions)):
    add_grouped_bar_chart(
        slide,
        title       = cd["title"],
        series_data = cd["series"],
        left        = pos[0],
        top         = pos[1],
        width       = CH_W,
        height      = CH_H,
        y_min       = cd["y_min"],
        y_max       = cd["y_max"],
    )

# ── shared legend at the top ──────────────────────────────────────────────────
def add_legend(slide, left, top, width, height):
    """Draw a simple legend box with two colour swatches."""
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN
    import pptx.oxml.ns as ns
    from lxml import etree

    # swatch + label for non-sycophantic (blue)
    box1 = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE = 1  (freeform rectangle)
        left, top + Inches(0.05), Inches(0.22), Inches(0.22)
    )
    box1.fill.solid()
    box1.fill.fore_color.rgb = BLUE
    box1.line.color.rgb = BLUE

    lbl1 = slide.shapes.add_textbox(
        left + Inches(0.26), top, Inches(1.8), Inches(0.32)
    )
    lbl1.text_frame.text = "non-sycophantic AI model"
    p = lbl1.text_frame.paragraphs[0]
    p.font.size = Pt(10)
    p.font.color.rgb = RGBColor(0x20,0x20,0x20)

    # swatch + label for sycophantic (orange)
    box2 = slide.shapes.add_shape(
        1,
        left + Inches(2.2), top + Inches(0.05), Inches(0.22), Inches(0.22)
    )
    box2.fill.solid()
    box2.fill.fore_color.rgb = ORANGE
    box2.line.color.rgb = ORANGE

    lbl2 = slide.shapes.add_textbox(
        left + Inches(2.46), top, Inches(1.8), Inches(0.32)
    )
    lbl2.text_frame.text = "sycophantic AI model"
    p2 = lbl2.text_frame.paragraphs[0]
    p2.font.size = Pt(10)
    p2.font.color.rgb = RGBColor(0x20,0x20,0x20)

    # border rectangle around legend items
    border = slide.shapes.add_shape(
        1,
        left - Inches(0.05), top, Inches(4.22), Inches(0.32)
    )
    border.fill.background()
    border.line.color.rgb = RGBColor(0xCC, 0xCC, 0xCC)
    border.line.width = Pt(0.75)
    # send to back
    sp = border._element
    sp.getparent().remove(sp)
    slide.shapes._spTree.insert(2, sp)

legend_left = (SLIDE_W - Inches(4.22)) / 2
add_legend(slide, legend_left, Inches(0.22), Inches(4.22), Inches(0.32))

# ── save ─────────────────────────────────────────────────────────────────────
out_path = "/home/user/YouTube-Voice-Translator/AI_model_comparison.pptx"
prs.save(out_path)
print(f"Saved: {out_path}")
