import { createClient } from "@/lib/supabase/server"
import { UploadFileContent } from "@/components/marketplace/upload-file-content"

export default async function UploadFilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <UploadFileContent userId={user!.id} />
}
