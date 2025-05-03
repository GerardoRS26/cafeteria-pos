<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string;
  export let required = false;
</script>

<style>
  .money-input-container {
    position: relative;
  }
  .money-input-currency {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  .money-input {
    padding-left: 28px;
    width: 100%;
  }
</style>

<div class="money-input-container">
  <span class="money-input-currency">$</span>
  <input
    {id}
    {name}
    type="number"
    bind:value
    {required}
    class="form-input money-input"
    step="0.01"
    min="0"
    placeholder="0.00"
  />
</div>
