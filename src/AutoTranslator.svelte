<script>
  export let text = '';
  export let targetLang = 'fr';

  let translated = text;

  $: if (text && targetLang && targetLang !== 'en') {
    translate();
  }

  async function translate() {
   const res = await fetch('https://translate.astian.org/translate', {
  method: 'POST',
  body: JSON.stringify({
    q: text,
    source: 'en',
    target: targetLang,
    format: 'text'
  }),
  headers: { 'Content-Type': 'application/json' }
});

    const data = await res.json();
    translated = data.translatedText || text;
  }
</script>

<span>{translated}</span>
