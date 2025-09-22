import type { BarkNode } from "~/routes/content-library.$";

function getSupabaseImageUrl(supabasePath: string): string {
  const supabaseUrl = "https://ccvpvzcwyoarkxxhpfrv.supabase.co";
  return `${supabaseUrl}/storage/v1/object/public/CMS/${supabasePath}`;
}

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
      {file.supabasePath && (
        <div>
          <img
            src={getSupabaseImageUrl(file.supabasePath)}
            alt={file.name}
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
        </div>
      )}
    </div>
  );
}
