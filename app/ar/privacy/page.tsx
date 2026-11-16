import { permanentRedirect } from "next/navigation";

// Preserve existing Arabic privacy-policy links without maintaining a divergent policy.
export default function Page() {
  permanentRedirect("/en/privacy");
}
