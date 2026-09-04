import os
from PIL import Image

def stitch_tiles(tile_dir, prefix='4', ext='.jpg', grid_size=16):
    """
    将瓦片拼接成一张大图
    :param tile_dir: 瓦片所在目录
    :param prefix: 文件名前缀，例如 '4'
    :param ext: 文件扩展名，例如 '.jpg'
    :param grid_size: 每行/列的瓦片数量（假设正方形网格）
    """
    tile_size = 256
    output_width = grid_size * tile_size
    output_height = grid_size * tile_size
    output_image = Image.new('RGB', (output_width, output_height))

    for y in range(grid_size):          # 行（垂直方向）
        for x in range(grid_size):      # 列（水平方向）
            filename = f"{prefix}_{x}_{y}{ext}"
            filepath = os.path.join(tile_dir, filename)

            try:
                tile = Image.open(filepath)
                # 确保尺寸正确，若不对则缩放
                if tile.size != (tile_size, tile_size):
                    tile = tile.resize((tile_size, tile_size))
                # 粘贴到对应位置
                output_image.paste(tile, (x * tile_size, y * tile_size))
            except FileNotFoundError:
                print(f"⚠️ 警告：文件 {filepath} 不存在，已跳过")
            except Exception as e:
                print(f"❌ 读取 {filepath} 时出错：{e}")

    return output_image


if __name__ == "__main__":
    # ---------- 可修改参数 ----------
    TILE_DIR = "."          # 瓦片所在文件夹，默认为当前目录
    PREFIX = "4"            # 文件名前缀
    EXT = ".jpg"            # 文件扩展名
    GRID = 16               # 每行/列的瓦片数量（16×16=256）
    OUTPUT_NAME = "stitched_output.png"
    # ------------------------------

    print(f"正在拼接 {GRID}×{GRID} 张瓦片...")
    result = stitch_tiles(TILE_DIR, PREFIX, EXT, GRID)
    result.save(OUTPUT_NAME)
    print(f"✅ 拼接完成！结果已保存为 {OUTPUT_NAME}")