import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import FloatingInput from "../components/FloatingInput.tsx";
import QueryInput from "../islands/SendMessage.tsx";

export default define.page(function Home() {
  return (
    <div class="min-h-screen bg-background">
      <Head>
        <title>Zoom Genie</title>
      </Head>
      <FloatingInput>
        <QueryInput />
      </FloatingInput>
    </div>
  );
});
