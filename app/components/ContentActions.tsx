import { Button } from "@mantine/core";
import type { BarkNode } from "~/routes/content-library.$";

interface ContentActionsProps {
  parentNode: BarkNode;
}

export default function ContentActions({ parentNode }: ContentActionsProps) {
  return (
    <div className="flex gap-4 m-4">
      <form method="post">
        <input type="hidden" name="parentId" value={parentNode.id} />
        <input type="hidden" name="displayPath" value={parentNode.displayPath} />
        <input type="hidden" name="intent" value="create-folder" />
        <Button type="submit">Create Folder</Button>
      </form>
      <form method="post">
        <input type="hidden" name="parentId" value={parentNode.id} />
        <input type="hidden" name="displayPath" value={parentNode.displayPath} />
        <input type="hidden" name="intent" value="upload-file" />
        <Button type="submit" variant="outline">Upload File</Button>
      </form>
    </div>
  );
}
