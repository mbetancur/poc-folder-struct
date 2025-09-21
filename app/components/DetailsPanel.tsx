import type { BarkNode } from "~/routes/content-library.$";

interface DetailsPanelProps {
	file: BarkNode | undefined;
}

export default function DetailsPanel({ file }: DetailsPanelProps) {
	if (!file) {
		return (
			<div>
				No file selected.
			</div>
		);
	}

	return (
		<div>
			<h2>File Details</h2>
			<p>Name: {file.name}</p>
			<p>Supabase Path: {file.supabasePath}</p>
			{/* <img src={} alt={file.name} /> */}
		</div>
	);
}
