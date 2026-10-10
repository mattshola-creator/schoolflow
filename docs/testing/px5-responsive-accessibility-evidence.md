# PX5 responsive and accessibility evidence register

| Evidence area        | Automated/repository evidence                                            | Human/browser evidence          | PX6 requirement                                  |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------ |
| Mobile shell/drawers | Focus trap, Escape, restoration, scroll lock and unique navigation tests | Founder accepted PX1            | Retest each migrated route at 320/375/390px      |
| Workspace tabs       | Contained scrolling, active reveal, keyboard arrows and focus            | Founder reviewed Packs B–E      | Retain discoverability cue without page overflow |
| Registers            | Mobile cards or contained tables; measured overflow cue                  | Pack E cue accepted             | Select pattern by data complexity                |
| Forms/actions        | Labels, focus, 44px targets and disabled prototype actions               | Founder review                  | Test real validation and mutation states         |
| Motion               | Reduced-motion CSS/component coverage                                    | Manual review limited           | Repeat browser/OS reduced-motion testing         |
| High zoom            | Responsive contracts                                                     | Incomplete independent evidence | Mandatory 200%/400% review in PX6 release units  |
| Screen reader        | Semantic assertions                                                      | Not comprehensively performed   | Mandatory critical-journey manual checks         |
| Breakpoints          | 320–1920px matrices across packs                                         | Founder desktop/mobile captures | Per-route desktop/tablet/mobile evidence         |

Netlify Team Protection blocked independent Work-browser capture for protected
pack previews. Founder visual evidence is retained as founder evidence, not
relabelled as Work verification.
