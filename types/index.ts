import { z } from "zod"
import { dictionarySchema } from "./dictionarySchema"

export type Dictionary = z.infer<typeof dictionarySchema>
export { dictionarySchema }