<script lang="ts">
  export type IconName =
    | 'today'
    | 'missions'
    | 'projects'
    | 'world'
    | 'plus'
    | 'arrow'
    | 'check'
    | 'back'
    | 'settings'
    | 'spark'
    | 'book'
    | 'pause'
    | 'swords'
    | 'person'
    | 'companion'
    | 'map';
  let { name, size = 22 }: { name: IconName; size?: number } = $props();
  const paths: Record<IconName, string> = {
    today:
      'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    missions:
      'M9 5h10v15H5V5h4m0-2h6v4H9V3m-1 9 1 1 2-2m2 1h3m-8 5 1 1 2-2m2 1h3',
    projects: 'M4 20V5h6l2 3h8v12H4m4-7h8m-8 4h5',
    world: 'm3 19 6-13 4 8 3-6 5 11H3m6-13 1 6 3 2',
    plus: 'M12 5v14M5 12h14',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    check: 'm5 12 4 4L19 6',
    back: 'M20 12H4m6-6-6 6 6 6',
    settings:
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m-1-5h2l1 3 3 1 3-1 1 2-2 3v3l2 2-1 2-3-1-3 1-1 3h-2l-1-3-3-1-3 1-1-2 2-2v-3L3 8l1-2 3 1 3-1 1-3',
    spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3',
    book: 'M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1V4',
    pause: 'M8 5v14M16 5v14',
    swords:
      'm4 3 7 5-3 3-5-7 1-1m16 0-7 5 3 3 5-7-1-1M7 14l3 3m4-7 6 10m-3-6-3 3M10 10 4 20m-2 0 3 2m14-2 3 2',
    person:
      'M12 3c-4 0-6 5-6 8l3-2h6l3 2c0-3-2-8-6-8Zm-3 6 1 6h4l1-6M5 21l2-6 5 3 5-3 2 6H5',
    companion:
      'M9 13c-2 2-5 4-4 6 1 2 4 0 7 0s6 2 7 0c1-2-2-4-4-6-2-2-4-2-6 0ZM5 8c-2-2-3 1-2 3s3 0 2-3Zm5-3c0-3-3-3-3 0s3 3 3 0Zm7 0c0-3-3-3-3 0s3 3 3 0Zm5 6c1-2 0-5-2-3s0 5 2 3',
    map: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5m6-2v16m6-14v16',
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"><path d={paths[name]} /></svg
>
