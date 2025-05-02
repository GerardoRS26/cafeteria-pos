<script lang="ts">
  import { enhance } from '$app/forms';
  let error: string | null = null;
</script>

<h1>Nuevo Producto</h1>

{#if error}
  <p class="error">{error}</p>
{/if}

<form method="POST" use:enhance>
  <label>
    Nombre:
    <input name="name" type="text" required minlength="3" />
  </label>

  <label>
    Precio:
    <input name="price" type="number" step="0.01" min="0" required />
  </label>

  <button type="submit">Guardar</button>
</form>
