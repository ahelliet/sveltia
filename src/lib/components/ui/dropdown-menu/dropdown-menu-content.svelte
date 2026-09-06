<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 8,
		align = "start",
		children,
		...restProps
	}: DropdownMenuPrimitive.ContentProps = $props();
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.Content
		bind:ref
		data-slot="dropdown-menu-content"
		{sideOffset}
		{align}
		class={cn(
			"z-50 min-w-40 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
			"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
			"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Portal>
