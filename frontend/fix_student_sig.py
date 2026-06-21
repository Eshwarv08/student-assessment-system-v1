import os
import glob

files = glob.glob('/home/ganapathi/Pictures/clone/frontend/src/components/Q*Booklet.tsx')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # We want to replace {isStudent ? '' : 'Click to sign'} with {isStudent ? 'Click to sign' : ''}
    # BUT only for the student signature parts.
    # To be safe, let's find the places where `answers.student_signature_url` is checked and right after it replace it.
    
    # In some files it's inline like:
    # {answers.student_signature_url ? <img ... /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}
    # In others it's multi-line.
    
    # Let's just do a string replacement for the exact inline string first
    old_inline = "<span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}"
    new_inline = "<span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>}"
    
    lines = content.split('\n')
    changed = False
    for i in range(len(lines)):
        if "answers.student_signature_url" in lines[i] and "{isStudent ? '' : 'Click to sign'}" in lines[i]:
            lines[i] = lines[i].replace("{isStudent ? '' : 'Click to sign'}", "{isStudent ? 'Click to sign' : ''}")
            changed = True
        # For multi-line, if answers.student_signature_url is above it, we just check if it's the student signature block
        if "student_signature_url" in lines[i] or (i > 0 and "student_signature_url" in lines[i-1]) or (i > 1 and "student_signature_url" in lines[i-2]) or (i > 2 and "student_signature_url" in lines[i-3]) or (i > 3 and "student_signature_url" in lines[i-4]):
            if "{isStudent ? '' : 'Click to sign'}" in lines[i]:
                lines[i] = lines[i].replace("{isStudent ? '' : 'Click to sign'}", "{isStudent ? 'Click to sign' : ''}")
                changed = True

    if changed:
        with open(f, 'w') as file:
            file.write('\n'.join(lines))
        print(f"Fixed {f}")

