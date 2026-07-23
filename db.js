require("dotenv/config");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createJob(id, modpackId) {
  const { error } = await supabase
    .from("jobs")
    .insert({ id, modpack_id: modpackId, status: "processing" });
  if (error) throw error;
}

async function updateJob(id, status, resultUrl) {
  const { error } = await supabase
    .from("jobs")
    .update({ status, result_url: resultUrl })
    .eq("id", id);
  if (error) throw error;
}

async function getJob(id) {
  const { data, error } = await supabase
    .from("jobs")
    .select("status, result_url")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

module.exports = { createJob, updateJob, getJob };