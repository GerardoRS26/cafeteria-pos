<script lang="ts">
  export let product: { id: string; name: string; price: number };
</script>

<article>
  <h2>{product.name}</h2>
  <p>${product.price.toFixed(2)}</p>

  <form method="POST" action="/admin/products?/delete">
    <input type="hidden" name="id" value={product.id} />
    <button type="submit">Eliminar</button>
  </form>
</article>

<style>
  article { border: 1px solid #ddd; padding: 1rem; }
</style>
