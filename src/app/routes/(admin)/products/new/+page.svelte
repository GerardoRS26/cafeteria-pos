<script lang="ts">
  import { enhance } from '$app/forms';
  import MoneyInput from '$lib/components/MoneyInput.svelte';

  export let data; // Recibe datos del server
  let formData = data?.formData || { // Recupera datos en caso de error
    name: '',
    description: '',
    price: '0.00',
    cost: '0.00'
  };
  let formError = data?.error || null;
</script>


<style>
  .form-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .form-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
  .error-message {
    background-color: #fee2e2;
    border: 1px solid #fca5a5;
    color: #dc2626;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
  }
  .form-group {
    margin-bottom: 16px;
  }
  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #444;
  }
  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  .form-textarea {
    min-height: 100px;
  }
  .grid-cols-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  .btn {
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-primary {
    background-color: #2563eb;
    color: white;
    border: none;
  }
  .btn-secondary {
    background-color: #e5e7eb;
    color: #333;
    border: none;
  }
</style>

<div class="form-container">
  <h1 class="form-title">Nuevo Producto</h1>

  {#if formError}
    <div class="error-message">
      {formError}
    </div>
  {/if}

  <form method="POST" use:enhance={{ result: handleResult }}>
    <div class="form-group">
      <label for="name" class="form-label">Nombre*</label>
      <input
        id="name"
        name="name"
        type="text"
        bind:value={formData.name}
        required
        minlength="3"
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="description" class="form-label">Descripción</label>
      <textarea
        id="description"
        name="description"
        bind:value={formData.description}
        class="form-input form-textarea"
      ></textarea>
    </div>

    <div class="grid-cols-2">
      <div class="form-group">
        <label for="price" class="form-label">Precio*</label>
        <MoneyInput
          id="price"
          name="price"
          bind:value={formData.price}
          required
        />
      </div>

      <div class="form-group">
        <label for="cost" class="form-label">Costo*</label>
        <MoneyInput
          id="cost"
          name="cost"
          bind:value={formData.cost}
          required
        />
      </div>
    </div>

    <div class="form-actions">
      <a href="/admin/products" class="btn btn-secondary">Cancelar</a>
      <button type="submit" class="btn btn-primary">Guardar Producto</button>
    </div>
  </form>
</div>
