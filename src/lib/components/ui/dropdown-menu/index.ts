import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import Trigger from "./dropdown-menu-trigger.svelte";
import Content from "./dropdown-menu-content.svelte";
import Item from "./dropdown-menu-item.svelte";

// Hand-authored to match this project's other ui/ components (button,
// card, aspect-ratio, carousel) rather than generated via the shadcn-svelte
// CLI (not runnable from this environment) — same bits-ui primitives and
// Tailwind tokens the CLI-generated version would use, trimmed to just
// Root/Trigger/Content/Item since that's all Navigation.svelte needs (no
// checkboxes, radio groups or submenus here).
const Root = DropdownMenuPrimitive.Root;

export {
	Root,
	Trigger,
	Content,
	Item,
	//
	Root as DropdownMenu,
	Trigger as DropdownMenuTrigger,
	Content as DropdownMenuContent,
	Item as DropdownMenuItem,
};
