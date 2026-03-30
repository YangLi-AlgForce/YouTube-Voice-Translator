from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.chart.data import ChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import copy
from lxml import etree

# Colors
BLUE = RGBColor(0x87, 0xC2, 0xE0)   # non-sycophantic
ORANGE = RGBColor(0xE8, 0x96, 0x3C) # sycophantic
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x00, 0x00, 0x00)
DARK_GRAY = RGBColor(0x33, 0x33, 0x33)

def add_bar_chart(slide, title_text, categories, series1_vals, series2_vals,
                  left, top, width, height,
                  annotations, y_min=2, y_max=6):
    """Add a grouped bar chart to the slide."""
    chart_data = ChartData()
    chart_data.categories = categories
    chart_data.add_series('non-sycophantic AI model', series1_vals)
    chart_data.add_series('sycophantic AI model', series2_vals)

    chart_frame = slide.shapes.add_chart(
        XL_CHART_TYPE.COLUMN_CLUSTERED,
        left, top, width, height,
        chart_data
    )
    chart = chart_frame.chart

    # Chart title
    chart.has_title = True
    chart.chart_title.text_frame.text = title_text
    tf = chart.chart_title.text_frame
    tf.paragraphs[0].font.size = Pt(11)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = DARK_GRAY

    # Value axis (Y)
    val_axis = chart.value_axis
    val_axis.minimum_scale = y_min
    val_axis.maximum_scale = y_max
    val_axis.major_unit = 1
    val_axis.has_major_gridlines = True
    val_axis.tick_labels.font.size = Pt(9)
    val_axis.axis_title.text_frame.text = "Mean (1-7)"
    val_axis.axis_title.text_frame.paragraphs[0].font.size = Pt(9)
    val_axis.axis_title.text_frame.paragraphs[0].font.color.rgb = DARK_GRAY

    # Category axis (X)
    cat_axis = chart.category_axis
    cat_axis.tick_labels.font.size = Pt(9)
    cat_axis.has_major_gridlines = False

    # Series colors
    series0 = chart.series[0]
    series0.format.fill.solid()
    series0.format.fill.fore_color.rgb = BLUE

    series1 = chart.series[1]
    series1.format.fill.solid()
    series1.format.fill.fore_color.rgb = ORANGE

    # Legend
    chart.has_legend = False

    # Gap width
    chart_xml = chart._element
    # Set gap width to ~100 (default is 150)
    for barChart in chart_xml.iter('{http://schemas.openxmlformats.org/drawingml/2006/chart}barChart'):
        gapWidth = barChart.find('{http://schemas.openxmlformats.org/drawingml/2006/chart}gapWid')
        if gapWidth is not None:
            gapWidth.set('val', '100')
        else:
            gw = etree.SubElement(barChart, '{http://schemas.openxmlformats.org/drawingml/2006/chart}gapWid')
            gw.set('val', '100')

    return chart_frame


def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)

    slide_layout = prs.slide_layouts[6]  # blank
    slide = prs.slides.add_slide(slide_layout)

    # Background white
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = WHITE

    # ── Title ──
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.18), Inches(12), Inches(0.55))
    tf = title_box.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.text = "4    用户对阿谀奉承型人工智能模型的信任和偏好"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = DARK_GRAY

    # ── Legend ──
    legend_left = Inches(3.5)
    legend_top = Inches(0.85)

    # Blue swatch
    blue_box = slide.shapes.add_shape(1, legend_left, legend_top + Inches(0.05), Inches(0.22), Inches(0.22))
    blue_box.fill.solid()
    blue_box.fill.fore_color.rgb = BLUE
    blue_box.line.color.rgb = BLUE

    label1 = slide.shapes.add_textbox(legend_left + Inches(0.28), legend_top, Inches(1.8), Inches(0.32))
    label1.text_frame.text = "non-sycophantic AI model"
    label1.text_frame.paragraphs[0].font.size = Pt(9)
    label1.text_frame.paragraphs[0].font.color.rgb = DARK_GRAY

    # Orange swatch
    orange_box = slide.shapes.add_shape(1, legend_left + Inches(2.2), legend_top + Inches(0.05), Inches(0.22), Inches(0.22))
    orange_box.fill.solid()
    orange_box.fill.fore_color.rgb = ORANGE
    orange_box.line.color.rgb = ORANGE

    label2 = slide.shapes.add_textbox(legend_left + Inches(2.48), legend_top, Inches(1.8), Inches(0.32))
    label2.text_frame.text = "sycophantic AI model"
    label2.text_frame.paragraphs[0].font.size = Pt(9)
    label2.text_frame.paragraphs[0].font.color.rgb = DARK_GRAY

    # ── Chart data ──
    # Study 2, Study 3 categories
    categories = ['Study 2', 'Study 3']

    charts_config = [
        {
            "title": "a.  Response quality",
            "s1": (4.95, 5.30),   # non-syco
            "s2": (5.37, 5.76),   # syco
            "annotations": ["+0.42(+9%)", "+0.46(+9%)"],
            "pos": (0.4, 1.2, 3.0, 2.5),
        },
        {
            "title": "b.  Return likelihood",
            "s1": (4.27, 4.72),
            "s2": (4.81, 5.33),
            "annotations": ["+0.54(+13%)", "+0.61(+13%)"],
            "pos": (6.9, 1.2, 3.0, 2.5),
        },
        {
            "title": "c.  Performance trust",
            "s1": (4.72, 5.27),
            "s2": (4.99, 5.70),
            "annotations": ["+0.27(+6%)", "+0.43(+8%)"],
            "pos": (0.4, 4.0, 3.0, 2.5),
        },
        {
            "title": "d.  Moral trust",
            "s1": (4.62, 5.18),
            "s2": (4.91, 5.63),
            "annotations": ["+0.29(+6%)", "+0.45(+9%)"],
            "pos": (6.9, 4.0, 3.0, 2.5),
        },
    ]

    for cfg in charts_config:
        l, t, w, h = cfg["pos"]
        add_bar_chart(
            slide,
            cfg["title"],
            categories,
            cfg["s1"],
            cfg["s2"],
            Inches(l), Inches(t), Inches(w), Inches(h),
            cfg["annotations"],
        )

    # ── Caption ──
    caption_top = Inches(6.6)
    caption_box = slide.shapes.add_textbox(Inches(0.4), caption_top, Inches(12.5), Inches(0.85))
    tf = caption_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.font.size = Pt(8.5)
    p.font.color.rgb = DARK_GRAY
    p.text = (
        "图5：在研究2和研究3中，参与者在与奉承型（Syco）人工智能模型互动后，报告了更高的再次互动可能性、"
        "响应质量和信任度，而与非奉承型（Non-syco）人工智能模型互动后则未报告此结果。柱状图显示了平均评分（1-"
        "7分李克特量表）及其95%置信区间（1.96）。± 标准误差）。每对柱状图都标注了均值之差（Syco）。– 非谄媚"
        "型）及其相对百分比变化。这揭示了谄媚行为的明显动机：它更符合用户的即时偏好，并助长了对人工智能模型的依赖。"
    )

    output_path = "/home/user/YouTube-Voice-Translator/figure5_sycophancy.pptx"
    prs.save(output_path)
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    create_presentation()
