# State and Validation Rules

## Where Each Kind of Data Lives
| Data | Tool |
|---|---|
| Data from the server | TanStack Query |
| Client-only state (session, UI flags, preferences) | Zustand |
| Form input | Local state or React Hook Form |
| Data that must survive a refresh | Zustand `persist` (uses `localStorage`) |

## TanStack Query Rules
- Fetch data with `useQuery`. Change data with `useMutation`.
- Do not use `useEffect` + `fetch` or `axios` to load data.
- Use clear query keys, for example `['resource', { page, filter }]`.
- After a mutation, call `queryClient.invalidateQueries` to refresh the data.
- Put API calls in `src/services/`. Put query hooks in `src/hooks/`.

## Zustand Rules
- Use Zustand only for client state.
- Do not copy API data into a Zustand store. TanStack Query already owns it.
- One store per feature, named `use<Feature>Store`.
- Select only what you need: `useStore((s) => s.value)`.

## Zod: Backend (Required)
- Validate every POST, PUT, and PATCH request `body` with Zod.
- Validate `query` and `params` when the endpoint uses them.
- Validate environment variables at startup.
- Validate responses from third-party APIs when the data shape may change.
- Put schemas in a `schemas/` folder. Name them `<action><Resource>Schema`.
- Use `safeParse`. On failure, return `400` with `error.issues`.

## Zod: Frontend (Optional)
- Use Zod only for forms with many fields or many rules (for example sign-up, checkout).
- Connect it with React Hook Form and `zodResolver`.
- For simple forms, use HTML validation (`required`, `type="email"`, `minLength`) instead.
- Do not validate responses from our own backend.
- Do not validate `localStorage` data.
- The frontend check is only for user experience. It never replaces backend validation.

## Backend Validation Pattern
```js
// middleware/validate.js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }
  req.body = result.data;
  next();
};
```

## Do Not
- Do not store the same data in both TanStack Query and Zustand.
- Do not skip backend validation on any POST, PUT, or PATCH endpoint.
- Do not create `.ts` or `.tsx` files.
