<script lang="ts">
  const corners = ['nw', 'ne', 'se', 'sw'];
</script>

<!-- Fixed-size corners keep the engraving crisp at every panel size. -->
<span class="rpg-trim lmu-decorative" aria-hidden="true">
  {#each corners as corner (corner)}
    <svg class={corner} viewBox="0 0 32 32" fill="none">
      <path d="M1 25V12C7 12 12 7 12 1h13M5 27V16C11 15 15 11 16 5h11" />
      <path d="m10 10 4 1-3 3-1-4ZM4 4h3v3H4Z" />
    </svg>
  {/each}
  <span class="rpg-trim-jewel"></span>
</span>
