# Screeno authentication design

The minimal white illustration/form card follows the latest user-supplied reference. Screeno's cobalt blue and lime remain the brand colors. Manrope is the only typeface throughout authentication and the landing page. The earlier condensed display font and its assets have been removed.

Account type is a custom dropdown shown only on signup. Switching the dropdown preserves entered details and directs the verification step and sign-in links to the selected account type. Login, recovery, reset, and OTP screens have no role selector. Fields use underlined borders and small functional icons. At phone widths the illustration is hidden to keep forms within the viewport.

Recovery inspiration: [Imran Jakir's password recovery and verification flow](https://dribbble.com/shots/26822066-Forgot-Password-Flow-UI-Modern-Verification-Reset-Screens). The implementation uses original line-art ornaments, progress steps, and existing demo verification behavior; no artwork was copied from that reference.

## Generated illustration

- Mode: built-in imagegen, new image generation.
- Current asset: `public/marketing/screeno-auth-editorial.webp` (900 × 1125, optimized WebP).
- Original retained in the Codex generated-images folder.
- Descriptive alt text is supplied in `components/auth/AuthShell.tsx`.

### Final generation prompt

Create a refined hand-painted editorial illustration for a hiring app authentication page on a PURE WHITE #FFFFFF background. A friendly minimal stick-man cartoon with round ivory head, two tiny dark navy eyes and a warm little smile, thin dark navy limbs, cobalt blue jacket and trousers, sits casually on a simple pale wood chair using a silver laptop on his lap. Lime green small neck scarf. One elegant leafy green potted plant behind the chair, a tiny stack of papers at the side, restrained lime accents. Entire character, chair and plant fully visible with wide white breathing room all around. White background has no scenery, no gradients, no frames or colored panels, only a delicate natural gray contact shadow beneath chair. Artistic watercolor and pencil texture with clean contemporary editorial polish, like a thoughtful magazine illustration, not glossy 3D. Center composition portrait 4:5. Cobalt #0649b5, lime #b1ff43, deep charcoal, soft natural paper colors. Subject should occupy central 70 percent. No text, no typography, no logos, no UI, no badges, no letters, no borders, no watermarks. Used as a quiet illustration on left half of a spacious minimalist white sign-in card.
