<script>
  import { echo } from "../lib/echo";

  let documentId = 1;
  let annotations = [];
  let text = "";
  let user = "Salem"; // later from auth

  echo.channel("document." + documentId)
    .listen("AnnotationUpdated", (e) => {
      annotations = [
        ...annotations.filter(a => a.id !== e.annotation.id),
        e.annotation
      ];
    });

  function addText() {
    const annotation = {
      id: Date.now(),
      type: "text",
      value: text,
      x: 100,
      y: 100,
      page: 1,
      user: user
    };

    annotations = [...annotations, annotation];

    fetch(`http://localhost:8080/api/documents/${documentId}/annotation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation)
    });

    text = "";
  }
</script>

<input bind:value={text} placeholder="Write text" />
<button on:click={addText}>Add</button>

<div class="pdf">
  {#each annotations as a}
    <div class="annotation" style="left:{a.x}px; top:{a.y}px">
      {a.value} — <small>{a.user}</small>
    </div>
  {/each}
</div>

<style>
.pdf {
  position: relative;
  width: 600px;
  height: 800px;
  border: 1px solid black;
}
.annotation {
  position: absolute;
  background: yellow;
  padding: 2px 4px;
}
</style>
