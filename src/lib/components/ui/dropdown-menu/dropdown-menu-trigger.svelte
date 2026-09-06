<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: DropdownMenuPrimitive.TriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger
	bind:ref
	data-slot="dropdown-menu-trigger"
	class={cn(
		"inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/30 aria-expanded:text-foreground",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Trigger>
