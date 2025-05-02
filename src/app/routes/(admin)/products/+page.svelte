<script lang="ts">
  import ProductCard from '$lib/components/ProductCard.svelte';
  export let data: { products: Array<{ id: string; name: string; price: number }> };
</script>

<h1>Gestión de Productos</h1>

<div class="grid">
  {#each data.products as product}
    <ProductCard {product} />
  {/each}
</div>

<a href="/admin/products/new" class="btn">Nuevo Producto</a>
