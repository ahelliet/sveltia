<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		child: childProp,
		children,
		...restProps
	}: DropdownMenuPrimitive.ItemProps = $props();

	const itemClass = cn(
		"flex cursor-pointer items-center rounded-md px-2.5 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
		className
	);
</script>

{#if childProp}
	<!-- Consumer provides its own element (Navigation.svelte renders a real
	     <a href="..."> here, for correct link semantics — right-click "open
	     in new tab", etc. — which a generic Item can't do on its own). We
	     still own the styling: merge our classes into the props handed to
	     that element. -->
	<DropdownMenuPrimitive.Item bind:ref data-slot="dropdown-menu-item" {...restProps}>
		{#snippet child({ props })}
			{@render childProp({ props: { ...props, class: cn(itemClass, props.class) } })}
		{/snippet}
	</DropdownMenuPrimitive.Item>
{:else}
	<DropdownMenuPrimitive.Item
		bind:ref
		data-slot="dropdown-menu-item"
		class={itemClass}
		{...restProps}
	>
		{@render children?.()}
	</DropdownMenuPrimitive.Item>
{/if}
