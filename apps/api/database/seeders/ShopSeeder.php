<?php

namespace Database\Seeders;

use App\Domain\Store\Models\Product;
use Illuminate\Database\Seeder;

/**
 * The six products from the design handoff. Images are the handoff's placeholder mockups (they carry third-party
 * branding and must be replaced before launch); prices and stock are placeholders too.
 */
class ShopSeeder extends Seeder
{
    public function run(): void
    {
        $facts = [['k' => 'Pickup', 'v' => 'Merchandise desk, venue'], ['k' => 'Material', 'v' => 'Cotton blend'], ['k' => 'Returns', 'v' => 'Size swap at the desk']];
        $sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        $img = fn (string ...$names) => array_map(fn ($n) => "/images/merch/{$n}.png", $names);

        $products = [
            ['executive-polo', '37th Edition Executive Polo', 'apparel', 1250000, 'New', $img('polo', 'tee-black', 'tee-green'), [['name' => 'Cobalt', 'hex' => '#003070'], ['name' => 'White', 'hex' => '#ffffff'], ['name' => 'Brick', 'hex' => '#8c1f1c']], $sizes],
            ['hoodie-cap-set', 'Conference Hoodie + Cap set', 'apparel', 2500000, 'Bundle', $img('hoodie'), [['name' => 'Brick', 'hex' => '#8c1f1c']], $sizes],
            ['conference-tee', 'Conference T-shirt', 'apparel', 800000, null, $img('tee-green'), [['name' => 'Green', 'hex' => '#2f7d4f']], $sizes],
            ['media-team-tee', 'Media Team T-shirt', 'apparel', 800000, null, $img('tee-black'), [['name' => 'Black', 'hex' => '#16181d']], $sizes],
            ['psalm-23-jersey', 'Psalm 23 Jersey', 'apparel', 1500000, null, $img('jersey'), [['name' => 'Black', 'hex' => '#16181d']], $sizes],
            ['ministers-journal', 'Ministers Syllabus & Prophetic Journal', 'books', 600000, null, [], [], []],
        ];

        foreach ($products as $i => [$slug, $name, $category, $price, $tag, $images, $colors, $productSizes]) {
            $product = Product::updateOrCreate(['slug' => $slug], [
                'name' => $name, 'category' => $category, 'price_kobo' => $price, 'tag' => $tag, 'images' => $images,
                'colors' => $colors, 'sizes' => $productSizes, 'facts' => $category === 'books' ? [['k' => 'Pickup', 'v' => 'Merchandise desk, venue']] : $facts,
                'description' => null, 'active' => true, 'sort' => $i,
            ]);

            $product->variants()->delete();
            foreach ($productSizes ?: [null] as $size) {
                foreach ($colors ?: [['name' => null]] as $color) {
                    $product->variants()->create(['size' => $size, 'color' => $color['name'], 'stock' => $category === 'books' ? 100 : ($size === 'L' ? 46 : 30)]);
                }
            }
        }
    }
}
