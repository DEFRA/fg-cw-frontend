import { findAll } from '../repositories/case-repository.js'

export const findAllCasesUseCase = async () => {
  const cases = await findAll()
  return cases
}
