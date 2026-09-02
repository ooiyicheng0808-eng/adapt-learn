async function testApi() {
  try {
    const res = await fetch("http://localhost:5000/api/chat/generate-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Needs a valid token, but maybe auth is mocked or we can just send fake?
        // Wait, route is behind `authenticate` middleware!
      },
      body: JSON.stringify({
        topicName: "Math 101"
      })
    });
    
    if (!res.ok) {
      console.log("Error status:", res.status);
      const text = await res.text();
      console.log("Error text:", text);
      return;
    }
    
    const data = await res.json();
    console.log("Success:", data);
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}

testApi();
