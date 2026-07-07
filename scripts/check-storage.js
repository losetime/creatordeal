const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('https://gueohzwpjczlvyqlollu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZW9oendwamN6bHZ5cWxvbGx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg4ODU4MywiZXhwIjoyMDk4NDY0NTgzfQ.bhWKjdmHmudd1s2-v_P03Ke2Q5gMl6-EXAgZL61u4Q0')

async function check() {
  // Check contracts bucket root
  const { data: root } = await supabase.storage.from('contracts').list('', { limit: 10 })
  console.log('Root:', root?.map(f => f.name))
  
  // Check contracts/contracts path
  const { data: level1 } = await supabase.storage.from('contracts').list('contracts', { limit: 10 })
  console.log('contracts/:', level1?.map(f => f.name))
  
  if (level1) {
    for (const folder of level1) {
      const { data: level2 } = await supabase.storage.from('contracts').list(`contracts/${folder.name}`, { limit: 10 })
      console.log(`contracts/${folder.name}/:`, level2?.map(f => f.name))
      if (level2) {
        for (const sf of level2) {
          const { data: level3 } = await supabase.storage.from('contracts').list(`contracts/${folder.name}/${sf.name}`, { limit: 10 })
          console.log(`contracts/${folder.name}/${sf.name}/:`, level3?.map(f => f.name))
        }
      }
    }
  }
}

check()
