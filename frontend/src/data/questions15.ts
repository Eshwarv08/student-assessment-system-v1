import {
  pat2PC, pat2PE, pat2CL,
  pat3PC, pat3PE, pat3CL,
  pat4PC, pat4PE, pat4CL,
  pat5PC, pat5PE, pat5CL,
  pat6PC, pat6PE, pat6CL,
  pat7PC, pat7PE, pat7CL,
  makeChecklistTable,
  makePCMappingTable,
  makePEMappingTable,
  makeProjectSignoffTable,
  makeAssessmentOutcomeTable,
  makeKA1ChecklistTable,
  makePA1PCMappingTable,
  makePA1PCMappingTableContinued,
  makePA1AttemptTable1,
  makePA1PEMappingTable,
  makePA1AttemptTable2,
  makePA1ChecklistTable
} from './questions15Helpers';

export const assessmentQuestions = {
  "metadata": {
    "title": "Assessment Booklet",
    "code": "ICTCBL334 ICTCBL329 ICTCBL249 ICTCBL253",
    "subtitle": "Pit, Pipe, Manholes and Cable Hauling",
    "course": "Pit, Pipe, Manholes and Cable Hauling",
    "rtoName": "ACTA College Pty. Ltd",
    "rtoCode": "RTO 40954"
  },
  "adminInfo": {
    "hideAdminUseOnly": true,
    "hideCommentsFeedback": true,
    "hideAssessorChecklist": true,
    "unitCodeName": "ICTCBL334 ICTCBL329 ICTCBL249 ICTCBL253 - Pit, Pipe, Manholes and Cable Hauling",
    "preRequisites": "N/A",
    "coRequisites": "N/A",
    "unitSummary": "This assessment package covers the skills and knowledge required to install and maintain underground telecommunications infrastructure, including pits, pipes, manholes, and cable hauling. It includes site preparation, rodding and roping, cable hauling techniques, and installation of enclosures in various site conditions.",
    "targetGroup": "Telecommunications technicians and cablers working on underground infrastructure.",
    "conditionsAndContext": "Skills must be assessed in a workplace or simulated environment where conditions are typical of those in a telecommunications work environment. Access is required to: site/s where pit, pipe and cable hauling can be conducted; relevant tools, equipment, and materials.",
    "specificResources": "Learner Guide, Assessment Booklet, Practical Workshop, Manufacturers Manuals, Workplace policy and procedures.",
    "reAssessment": "Refer to ACTA College Assessment Policy and Procedure.",
    "plagiarism": "ACTA College considers plagiarism and cheating as serious misconduct.",
    "complaints and appeals": "Refer to Student Handbook.",
    "assessorsIntervention": "Assessors are to ensure safety and follow standard assessment protocols.",
    "attachingDocuments": "Documents must be labelled with Unit Name, Student Name, ID, Date, and Signature.",
    "assessmentInstruction": "The assessment consists of 7 tasks: Task 1 (Practical Assessment), Task 2 (Knowledge Assessment), and Practical Tasks 2, 3, 4, 6, 7.",
    "taskOverviews": [
      { "id": "Task 1", "text": "Practical Assessment Task 1 - Site Preparation for Access and Hauling" },
      { "id": "Task 2", "text": "Knowledge Assessment Task 1 - Written Questions and Answers" },
      { "id": "Task 3", "text": "Practical Assessment Task 2 - Rod, Rope, Clean and Prove Conduit" },
      { "id": "Task 4", "text": "Practical Assessment Task 3 - Haul Cable" },
      { "id": "Task 5", "text": "Practical Assessment Task 4 - Install 4 New Pits" },
      { "id": "Task 6", "text": "Practical Assessment Task 5" },
      { "id": "Task 7", "text": "Practical Assessment Task 6 - Install Prefabricated Manhole, Conduit and Pit" },
      { "id": "Task 8", "text": "Practical Assessment Task 7 - Remove Pit and Conduit" }
    ],
    "competencyDecision": "Student must satisfactorily complete each assessment task to be Competent (C).",
    "coverSheetInstruction": "A cover sheet must be included with each submission."
  },

  "task0": {
    "title": "KNOWLEDGE ASSESSMENT TASK 1 - CHECKLIST",
    "assessorOnly": true,
    "sections": [
      makeKA1ChecklistTable()
    ]
  },

  "task8": {
    "title": "ASSESSMENT OUTCOME & COVER SHEET",
    "observationTitle": "ASSESSMENT COVER SHEET",
    "observationSubtitle": "Project Signoff and Final Outcome",
    "assessorOnly": true,
    "sections": [
      // Project Signoff Sheet
      makeProjectSignoffTable(),

      // Assessment Outcome
      makeAssessmentOutcomeTable()
    ]
  },

  "task1": {
    "title": "PRACTICAL ASSESSMENT TASK 1 – SITE PREPARATION",
    "observationTitle": "PRACTICAL ASSESSMENT TASK 1",
    "observationSubtitle": "Site Preparation for Access and Hauling",
    "sections": [
      {
        "type": "text",
        "title": "Assessment Instructions",
        "content": "Complete the following activities:\n1. Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice\n2. Refer to all tool/equipment instructions/manufacturers guidelines prior to use.\n3. Complete a JSA for the task\n4. Assemble manhole guards around a manhole\n5. Gas check manhole access hole\n6. Remove manhole lids with pit key and store lids correctly\n7. Assemble manhole guards around the pits\n8. Remove pit lids with pit key and store correctly\n9. Gas check the manhole as per spot sampling procedure and record readings\n10. Replace manhole lids and store guards in the correct location\n11. Submit your completed work to your supervisor (assessor) for inspection"
      },
      {
        "type": "image",
        "src": "/assets/question-15/task1.png",
        "caption": "Plan of proposed work"
      },
      {
        "type": "text",
        "title": "Recorded Gas Levels",
        "content": "Record the gas levels in the provided space during your practical demonstration.\n• O2 (%)\n• H2S (PPM)\n• CO (PPM)\n• LEL (%)"
      },
      {
        "type": "text",
        "title": "Assessment Task Description",
        "content": "For this assessment, you are working as a telco technician. You have been assigned a task by your supervisor to prepare the site for access and hauling of a new 50 pair cable to replace an existing cable between two pits adjacent to a manhole, and installing a new pit, a prefabricated manhole, in preparation for jointing. The supervisor has advised that this area is known for gas and that the adjacent manhole and the pits should be opened to allow the ducts to vent. You are also required to check for gas as per your workplace guidelines.\n\nPrior to commencing the task, you are required to assess the work site and complete a Job Safety Analysis (JSA) to capture and address hazards, unwanted events and potential risks for the job."
      },
      {
        "type": "text",
        "title": "Resources Required",
        "content": "• Learners Guide\n• Student Assessment Pack\n• Blue or Black Pen\n• WHS/OHS Acts/Regulations as applicable to the state of delivery\n• Codes of practice\n    ◦ How to manage work health and safety risks\n    ◦ Managing the work environment and facilities\n    ◦ Managing risks of plant in the workplace\n    ◦ Managing noise preventing hearing loss work\n    ◦ Managing the risk of falls at workplaces\n• Workplace procedure 01687W01 Working at Telstra Manholes and Pits\n• JSA-Included in this assessment pack\n• Installed two lid man-hole\n• Installed #6 Pit x2\n• Manhole guards*\n• Pit keys x2*\n• Gas detector*\n• Gas action chart\n• Retro reflective vest*\n• Gloves*\n• Hard Hat*\n• Safety glasses*\n\nManufacturers specifications and operating instructions for all tools & equipment specified with a *"
      },
      {
        "type": "text",
        "title": "Timing",
        "content": "Your assessor will advise you of the due date of these submissions."
      }
    ],
    "observationItems": [
      "Interpret construction design plan",
      "Arrange site access",
      "Identify and inform of worksite hazards",
      "Verify location of proposed installation",
      "Organise plant, tools and equipment",
      "Place recognised barriers",
      "Conduct gas checks",
      "Record gas levels"
    ],
    "assessorSections": [
      makePA1PCMappingTable(),
      makePA1PCMappingTableContinued(),
      makePA1AttemptTable1(),
      makePA1PEMappingTable(),
      makePA1AttemptTable2(),
      makePA1ChecklistTable()
    ]
  },

  "task2": {
    "title": "KNOWLEDGE ASSESSMENT TASK 1 – WRITTEN QUESTIONS AND ANSWERS",
    "sections": [
      {
        "type": "text",
        "title": "Student Instructions",
        "content": "Choose the correct answer for each of the following questions. Refer to your learner guide where specified. For questions referring to a plan, use the provided image."
      }
    ],
    "questions": [
      {
        "id": 1,
        "text": "1. The NBN (National Broadband Network) at the moment consists entirely of:",
        "type": "options",
        "options": [
          { "text": "a) Copper cable", "value": "a" },
          { "text": "b) Cat 7 cabling", "value": "b" },
          { "text": "c) Optical Fibre", "value": "c" },
          { "text": "d) Coaxial cable", "value": "d" }
        ]
      },
      {
        "id": 2,
        "text": "2. Identify whether the following statement is true or false: Category 3 copper cable is mainly used for voice applications.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 3,
        "text": "3. The Australian Standard that specifies installation requirements for customer cabling is:",
        "type": "options",
        "options": [
          { "text": "a) AUSTRALIAN STANDARD AS/NZ 3000:2007", "value": "a" },
          { "text": "b) | 017153a07 | TELSTRA’S LEAD-IN TRENCHING REQUIREMENTS.", "value": "b" },
          { "text": "c) AUSTRALIAN STANDARD AS/CA S008:2010", "value": "c" },
          { "text": "d) AUSTRALIAN STANDARD AS/CA S009:2013", "value": "d" }
        ]
      },
      {
        "id": 4,
        "text": "4. The Cable Provider Rules in Australia are:",
        "type": "options",
        "options": [
          { "text": "a) An industry-run registration scheme designed to promote self-regulation", "value": "a" },
          { "text": "b) A government run registration scheme designed to promote government regulation", "value": "b" },
          { "text": "c) A scheme in industry that is no longer used because of self-regulation", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 5,
        "text": "5. To manage health and safety on a worksite there should be:",
        "type": "options",
        "options": [
          { "text": "a) Hazard management plan", "value": "a" },
          { "text": "b) Free hard hats", "value": "b" },
          { "text": "c) Weather management plan", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 6,
        "text": "6. Before work begins, approvals should be obtained from:",
        "type": "options",
        "options": [
          { "text": "a) Likelihood that nothing will go wrong so don’t bother", "value": "a" },
          { "text": "b) No approvals are required", "value": "b" },
          { "text": "c) Authorities and asset owners", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 7,
        "text": "7. Typical tools and equipment may include:",
        "type": "options",
        "options": [
          { "text": "a) Shovels", "value": "a" },
          { "text": "b) Trenching equipment", "value": "b" },
          { "text": "c) Jointing equipment", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 8,
        "text": "8. To facilitate easier hauling of cables into conduits, which of the following can be used?",
        "type": "options",
        "options": [
          { "text": "a) Lubrication of the cable and ducts", "value": "a" },
          { "text": "b) The use of cable guides", "value": "b" },
          { "text": "c) The use of conduit guides", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 9,
        "text": "9. Name one device for cleaning conduits.",
        "type": "text"
      },
      {
        "id": 10,
        "text": "10. How does a winch used for small copper cables differ to one used for optical fibre cables?",
        "type": "options",
        "options": [
          { "text": "a) They are the same", "value": "a" },
          { "text": "b) Smaller hauling wheel", "value": "b" },
          { "text": "c) Larger hauling wheel", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 11,
        "text": "11. Identify whether the following statement is true or false: There is a need to ensure that the cable hauling tension is correct for the cable and that the bend radius is maintained and care is taken to protect the cable sheath during cable installation procedures.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 12,
        "text": "12. A multimeter can be used to check copper cables for:",
        "type": "options",
        "options": [
          { "text": "a) Continuity", "value": "a" },
          { "text": "b) Short circuits", "value": "b" },
          { "text": "c) Loop resistance", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 13,
        "text": "13. An induction/tone generator can be used to:",
        "type": "options",
        "options": [
          { "text": "a) Measuring cable pair loop resistance", "value": "a" },
          { "text": "b) Identifying pairs within cables", "value": "b" },
          { "text": "c) Identify open circuits", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 14,
        "text": "14. Wire map testers can test for:",
        "type": "options",
        "options": [
          { "text": "a) Open circuit", "value": "a" },
          { "text": "b) Short circuit", "value": "b" },
          { "text": "c) Reversed or split pairs", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 15,
        "text": "15. Identify whether the following statement is true or false: The need for surge protection on copper cables is determined by the cabling provider.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 16,
        "text": "16. Devices used to connect the feeder to cables are:",
        "type": "options",
        "options": [
          { "text": "a) Cables are never hauled this way", "value": "a" },
          { "text": "b) Hauling Eye & cable grip", "value": "b" },
          { "text": "c) Screw on cable cap or glue on cap", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 17,
        "text": "17. Sufficient cable length should be left in pits for:",
        "type": "options",
        "options": [
          { "text": "a) Cables are left as short as possible", "value": "a" },
          { "text": "b) Hauling", "value": "b" },
          { "text": "c) Jointing", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 18,
        "text": "18. On completion of the work, it is essential to send a ________ promptly to all parties and get sign off from the ________.",
        "type": "options",
        "options": [
          { "text": "a) Gift, ACMA", "value": "a" },
          { "text": "b) Report, customer", "value": "b" },
          { "text": "c) On completion nothing more is done", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 19,
        "text": "19. Reinstatement of the site is the responsibility of:",
        "type": "options",
        "options": [
          { "text": "a) ACMA", "value": "a" },
          { "text": "b) Customer", "value": "b" },
          { "text": "c) Contractor", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 20,
        "text": "20. Care must be taken when testing optical fibre cables to avoid:",
        "type": "options",
        "options": [
          { "text": "a) Foot damage due to the high weight of the fibres", "value": "a" },
          { "text": "b) Eye damage due to the laser light in the fibres", "value": "b" },
          { "text": "c) Optical fibre is not dangerous", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 21,
        "text": "21. Is it necessary to support cables in pits and enclosures?",
        "type": "options",
        "options": [
          { "text": "a) Yes", "value": "yes" },
          { "text": "b) No", "value": "no" }
        ]
      },
      {
        "type": "image",
        "src": "/assets/question-15/task1.png",
        "caption": "Plan for Questions 22-25"
      },
      {
        "id": 22,
        "text": "22. What is the diameter of duct is installed between boundary of 156 and 158 and boundary of 158 and 160 Hamilton Rd?",
        "type": "options",
        "options": [
          { "text": "a) 100mm", "value": "a" },
          { "text": "b) 50mm", "value": "b" },
          { "text": "c) 60mm", "value": "c" }
        ]
      },
      {
        "id": 23,
        "text": "23. What type (size) of pit is installed at the boundary of 156 and 158 Hamilton Rd?",
        "type": "options",
        "options": [
          { "text": "a) P4", "value": "a" },
          { "text": "b) P5", "value": "b" },
          { "text": "c) P6", "value": "c" }
        ]
      },
      {
        "id": 24,
        "text": "24. What kind of infrastructure is installed at the boundary of 150 and 152 Hamilton Rd?",
        "type": "options",
        "options": [
          { "text": "a) Manhole", "value": "a" },
          { "text": "b) Rope", "value": "b" },
          { "text": "c) Conduit", "value": "c" }
        ]
      },
      {
        "id": 25,
        "text": "25. What is the length of conduit is required to be installed in between boundary of 156 and 158 and boundary of 158 and 160 Hamilton Rd?",
        "type": "options",
        "options": [
          { "text": "a) 26M", "value": "a" },
          { "text": "b) 30M", "value": "b" },
          { "text": "c) 22M", "value": "c" }
        ]
      },
      {
        "id": 26,
        "text": "26. What is the permissible limit of LEL (Lower Explosive Limit) gases in a confined space?",
        "type": "options",
        "options": [
          { "text": "a) 10% of the volume", "value": "a" },
          { "text": "b) 5% of the volume", "value": "b" },
          { "text": "c) 8% of the volume", "value": "c" }
        ]
      },
      {
        "id": 27,
        "text": "27. What is the safest limit of oxygen in atmosphere?",
        "type": "options",
        "options": [
          { "text": "a) 19.5% to 23%", "value": "a" },
          { "text": "b) 23% to 27%", "value": "b" },
          { "text": "c) 15% to 19.5%", "value": "c" }
        ]
      },
      {
        "id": 28,
        "text": "28. What is the use of a Mandrel? Mandrels are used to prove the integrity of installed conduit runs. They will also remove small amounts of debris that may be in the conduit. Manufactured from high-strength aluminium alloy tube. Centre rod is plated all-thread steel. Eye on each end.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 29,
        "text": "29. How many percentage points should a mandrels be from a conduit size? The effective diameter of the mandrel must be 90 percent of the nominal pipe diameter and verified using a proving ring. The mandrel is sized to allow for up to 5% deformation of the installed pipe.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 30,
        "text": "30. How could avoid conduits get overhauled? Use the Mandrill to check the available capacity of the Conduit during rod and roping activity.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 31,
        "text": "31. What is the purpose of rod and roping? Rod and Roping is when new and existing conduit is proved and feed with rope to assist in the cable hauling on an existing copper and fibre cable for repairs, upgrades and new infrastructure works.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 32,
        "text": "32. The Customer Access Network connects end users of the:",
        "type": "options",
        "options": [
          { "text": "a) Network boundary", "value": "a" },
          { "text": "b) Telecommunications network", "value": "b" },
          { "text": "c) Property entry point", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 33,
        "text": "33. A Customer Private Network provides:",
        "type": "options",
        "options": [
          { "text": "a) An external telecommunications network that forms part of the global telecommunications network", "value": "a" },
          { "text": "b) A standalone internal telecommunications network that does not providing access to the global telecommunications network", "value": "b" },
          { "text": "c) An internal telecommunications network as well as providing access to the global telecommunications network", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 34,
        "text": "34. The National Broadband Network (NBN) currently consists entirely of:",
        "type": "options",
        "options": [
          { "text": "a) Copper cable", "value": "a" },
          { "text": "b) Cat 7 cabling", "value": "b" },
          { "text": "c) Optical Fibre", "value": "c" },
          { "text": "d) Coaxial cable", "value": "d" }
        ]
      },
      {
        "id": 35,
        "text": "35. Is it a requirement to hold a General Construction White Card to work on construction sites?",
        "type": "options",
        "options": [
          { "text": "a) Yes", "value": "yes" },
          { "text": "b) No", "value": "no" }
        ]
      },
      {
        "id": 36,
        "text": "36. The Code of Practise are created to:",
        "type": "options",
        "options": [
          { "text": "a) Ensure worst practice outcomes & promote negative behaviour changes in the industry", "value": "a" },
          { "text": "b) Provide guidelines for fair dealing between organisations and their customers", "value": "b" },
          { "text": "c) Provide guidelines for fair dealing between organisations", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 37,
        "text": "37. The Australian Standard that specifies underground Installation requirements for customer cabling is:",
        "type": "options",
        "options": [
          { "text": "a) AUSTRALIAN STANDARD AS/NZ 3000:2007", "value": "a" },
          { "text": "b) | 017153a07 | TELSTRA’S LEAD-IN TRENCHING REQUIREMENTS.", "value": "b" },
          { "text": "c) AUSTRALIAN STANDARD AS/CA S008:2010", "value": "c" },
          { "text": "d) AUSTRALIAN STANDARD AS/CA S009:2013", "value": "d" }
        ]
      },
      {
        "id": 38,
        "text": "38. The Telecommunications Act 1997 is:",
        "type": "options",
        "options": [
          { "text": "a) An industry body", "value": "a" },
          { "text": "b) Legislated law", "value": "b" },
          { "text": "c) A voluntary standard", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 39,
        "text": "39. The Cable Provider Rules in Australia are best characterised as?",
        "type": "options",
        "options": [
          { "text": "a) An industry-run registration scheme designed to promote self-regulation", "value": "a" },
          { "text": "b) A government run registration scheme designed to promote government regulation", "value": "b" },
          { "text": "c) A scheme in industry that is no longer used because of self-regulation", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 40,
        "text": "40. A typical street distribution plan might provide information on…",
        "type": "options",
        "options": [
          { "text": "a) The location of conduit runs", "value": "a" },
          { "text": "b) The location of electricity pedestals", "value": "b" },
          { "text": "c) The location of pits", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 41,
        "text": "41. Access to a site is usually arranged by the …",
        "type": "options",
        "options": [
          { "text": "a) ACMA", "value": "a" },
          { "text": "b) Site supervisor or Site Manager", "value": "b" },
          { "text": "c) No need for access permission for cablers", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 42,
        "text": "42. Witches hats are a form of …",
        "type": "options",
        "options": [
          { "text": "a) They are never used anymore", "value": "a" },
          { "text": "b) Flashing strobe light", "value": "b" },
          { "text": "c) Children’s toy", "value": "c" },
          { "text": "d) Protective barrier", "value": "d" }
        ]
      },
      {
        "id": 43,
        "text": "43. One form of barrier that could be used to protect people in manholes is …",
        "type": "options",
        "options": [
          { "text": "a) Hard hats", "value": "a" },
          { "text": "b) Guard rails", "value": "b" },
          { "text": "c) Safety glasses", "value": "c" },
          { "text": "d) Orange", "value": "d" }
        ]
      },
      {
        "id": 44,
        "text": "44. To manage health and safety and inform personnel on a worksite hazards there should be a …",
        "type": "options",
        "options": [
          { "text": "a) Hazard management plan", "value": "a" },
          { "text": "b) Free hard hats", "value": "b" },
          { "text": "c) Weather management plan", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 45,
        "text": "45. List one potential hazard that might be encountered when installing underground cable…",
        "type": "text"
      },
      {
        "id": 46,
        "text": "46. Before work begins approvals should be obtained from…",
        "type": "options",
        "options": [
          { "text": "a) Likelihood that nothing will go wrong so don’t bother", "value": "a" },
          { "text": "b) No approvals are required", "value": "b" },
          { "text": "c) Authorities and asset owners", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 47,
        "text": "47. Typical tools, plant and equipment may include…",
        "type": "options",
        "options": [
          { "text": "a) Shovels", "value": "a" },
          { "text": "b) Trenching equipment", "value": "b" },
          { "text": "c) Jointing equipment", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 48,
        "text": "48. Excavation for existing underground enclosures should be conduction with consideration for:",
        "type": "options",
        "options": [
          { "text": "a) Trench width kept to a minimum", "value": "a" },
          { "text": "b) Adequate clearances for ease of access", "value": "b" },
          { "text": "c) Shoring of trenches as required", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 49,
        "text": "49. Personal Protective Equipment (PPE) must be worn on site?",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 50,
        "text": "50. List two things that may cause constraints on your installation?",
        "type": "text"
      },
      {
        "id": 51,
        "text": "51. The installation requirements for underground telecommunications installations are outlined in Plans and Technical Standards.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 52,
        "text": "52. The maximum recommended number of 20 pair cables in a 50 mm conduit is?",
        "type": "options",
        "options": [
          { "text": "5", "value": "5" },
          { "text": "4", "value": "4" },
          { "text": "3", "value": "3" },
          { "text": "2", "value": "2" }
        ]
      },
      {
        "id": 53,
        "text": "53. The only colour conduit for communications cable is?",
        "type": "options",
        "options": [
          { "text": "a) Green", "value": "a" },
          { "text": "b) Orange", "value": "b" },
          { "text": "c) White", "value": "c" },
          { "text": "d) Yellow", "value": "d" }
        ]
      },
      {
        "id": 54,
        "text": "54. When installing conduit, conduit bends or couplings care should be taken to ensure:",
        "type": "options",
        "options": [
          { "text": "a) Free of external marks on the outside of the conduit and that the conduit ends must be of a green or blue in colour", "value": "a" },
          { "text": "b) Free of snag points by cutting the end of the conduit at a right angle to the axis of the conduit and removing all burrs and sharp edges using a file or scraper", "value": "b" },
          { "text": "c) Conduit is self-installing and doesn’t require any additional work", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 55,
        "text": "55. Telecommunications underground conduit installed in a location other than a public footpath or roadway?",
        "type": "options",
        "options": [
          { "text": "a) No special conditions required", "value": "a" },
          { "text": "b) Enclosed in a red conduit for easy identification", "value": "b" },
          { "text": "c) Enclosed in a compliant conduit", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 56,
        "text": "56. To ensure you have selected the correct excavation equipment and plants:",
        "type": "options",
        "options": [
          { "text": "a) You will need to check the task requirements, specifications and goals", "value": "a" },
          { "text": "b) You will need to check the weather, time and goals", "value": "b" },
          { "text": "c) You will need to check the user guides for the work, who is on site and goals", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 57,
        "text": "57. A multimeter can be used to check copper cables for?",
        "type": "options",
        "options": [
          { "text": "a) Continuity", "value": "a" },
          { "text": "b) Short circuits", "value": "b" },
          { "text": "c) Loop resistance", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 58,
        "text": "58. An induction /tone generator can be used to?",
        "type": "options",
        "options": [
          { "text": "a) Measuring cable pair loop resistance", "value": "a" },
          { "text": "b) Identifying pairs within cables", "value": "b" },
          { "text": "c) Identify open circuits", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 59,
        "text": "59. Wire map testers can test for?",
        "type": "options",
        "options": [
          { "text": "a) Open circuit", "value": "a" },
          { "text": "b) Short circuit", "value": "b" },
          { "text": "c) Reversed or split pairs", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 60,
        "text": "60. On completion of installation conduits should be tested for blockages to ensure they are free from impediments to cable hauling:",
        "type": "options",
        "options": [
          { "text": "a) Sures edges", "value": "a" },
          { "text": "b) Blockages", "value": "b" },
          { "text": "c) Kinks", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 61,
        "text": "61. A (TDR) Time Domain Reflectometer can be used to check copper cables for continuity, Short circuits, open circuit, cable length, and fault location.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 62,
        "text": "62. Name two methods for testing Optical Fibre cable?",
        "type": "text"
      },
      {
        "id": 63,
        "text": "63. An (OTDR) Optical Time Domain Reflectometer sends a pulse of light down the cable to locate insertion loss on optical fibre cables?",
        "type": "options",
        "options": [
          { "text": "a) Voltage", "value": "a" },
          { "text": "b) Light", "value": "b" },
          { "text": "c) High frequency", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 64,
        "text": "64. Which test setup will give the operator the most information in when testing Optical Fibre cable?",
        "type": "options",
        "options": [
          { "text": "a) Light Source/Power Meter method", "value": "a" },
          { "text": "b) OTDR", "value": "b" },
          { "text": "c) Both the same", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 65,
        "text": "65. The types of test equipment and the type of test will be determined by:",
        "type": "options",
        "options": [
          { "text": "a) Test results", "value": "a" },
          { "text": "b) The design parameters", "value": "b" },
          { "text": "c) What day the tests are done on", "value": "c" },
          { "text": "d) False", "value": "d" }
        ]
      },
      {
        "id": 66,
        "text": "66. Conduit ends are sealed to…",
        "type": "options",
        "options": [
          { "text": "a) Prevent the ingress of dirt and water", "value": "a" },
          { "text": "b) To make it easier to haul through ducts", "value": "b" },
          { "text": "c) The sealing makes jointing easier", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 67,
        "text": "67. Conduit should enter a pit or access hole through the long sides.",
        "type": "options",
        "options": [
          { "text": "a) True", "value": "true" },
          { "text": "b) False", "value": "false" }
        ]
      },
      {
        "id": 68,
        "text": "68. Wherever practicable, access-holes should be spaced at approximately…",
        "type": "options",
        "options": [
          { "text": "a) 230 m intervals", "value": "a" },
          { "text": "b) 320 m intervals", "value": "b" },
          { "text": "c) 330 m intervals", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 69,
        "text": "69. On completion of the work it is essential to send a report promptly to all parties and get sign off from the customer.",
        "type": "options",
        "options": [
          { "text": "a) Gift, ACMA", "value": "a" },
          { "text": "b) Report, customer", "value": "b" },
          { "text": "c) On completion, appropriate personnel of job", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 70,
        "text": "70. Reinstatement of the site is the responsibility of …",
        "type": "options",
        "options": [
          { "text": "a) ACMA", "value": "a" },
          { "text": "b) Customer", "value": "b" },
          { "text": "c) Contractor", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 71,
        "text": "71. Care must be taken when testing optical fibre cables to avoid …",
        "type": "options",
        "options": [
          { "text": "a) Foot damage due to the high weight of the fibres", "value": "a" },
          { "text": "b) Eye damage due to the laser light in the fibres", "value": "b" },
          { "text": "c) Optical fibre is not dangerous", "value": "c" },
          { "text": "d) All of the above", "value": "d" }
        ]
      },
      {
        "id": 72,
        "text": "72. Is it necessary to support cables in pits and enclosures?",
        "type": "options",
        "options": [
          { "text": "a) Yes", "value": "yes" },
          { "text": "b) No", "value": "no" }
        ]
      },
      {
        "id": 73,
        "text": "73. To enable future underground enclosure identification at a future date all enclosures must be …",
        "type": "options",
        "options": [
          { "text": "a) Marked legibly", "value": "a" },
          { "text": "b) Coloured red or green", "value": "b" },
          { "text": "c) Cables don’t need to be marked", "value": "c" },
          { "text": "d) None of the above", "value": "d" }
        ]
      },
      {
        "id": 74,
        "text": "74. Backfill of the site should be undertaken to ensure?",
        "type": "options",
        "options": [
          { "text": "a) the finished surface level does not settle beyond that acceptable to the contractor", "value": "a" },
          { "text": "b) the finished surface level does not settle beyond that acceptable to the local authority or the carrier", "value": "b" },
          { "text": "c) the finished surface level does not settle beyond that acceptable to the ACMA", "value": "c" },
          { "text": "d) the finished surface level is the responsibility of the local authority or the carrier", "value": "d" }
        ]
      },
      {
        "id": 75,
        "text": "75. The most common metals used in cables are ________ and ________. Recycling plants will granulate and then separate the metal from the ________. Using this process, the plastic is removed and the copper, aluminium or other metals present are separated for recycling. These metals are then smelted for reuse in new metal products. Similarly the plastic is melted and extruded for ________.",
        "type": "options",
        "options": [
          { "text": "a) Plastic, Rubber, Cables, Magnetically, Destruction", "value": "a" },
          { "text": "b) Copper, aluminium, insulation, magnetically, reuse", "value": "b" },
          { "text": "c) Lead, Bronze, Insulation, magnetically, destruction", "value": "c" }
        ]
      }
    ],
    "assessorSections": [
      makeKA1ChecklistTable()
    ]
  },

  "task3": {
    "title": "PRACTICAL ASSESSMENT TASK 2 – ROD, ROPE, CLEAN AND PROVE CONDUIT",
    "observationTitle": "PRACTICAL ASSESSMENT TASK 2",
    "observationSubtitle": "Rod, Rope, Clean and Prove Conduit",
    "sections": [
      {
        "type": "text",
        "title": "Assessment Instructions",
        "content": "Complete the following activities:\n1. Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice\n2. Refer to all tool/equipment instructions/manufacturers guidelines prior to use.\n3. Refer to the completed JSA for the task\n4. Ensure gas detector is on and carried on your person\n5. Assemble cable drum stand and fit drum to cable following all manual handling requirements.\n6. Clean any silt from bottom of pit\n7. Rod conduit\n8. Attach hauling line and draw through conduit\n9. Attach cleaning brush to hauling line and clean debris from conduit\n10. Prove conduit with appropriate size slug\n11. Leave hauling line in conduit\n12. Flame brush cable end\n13. Fit endcap and shrink to seal cable\n14. Submit your completed work to your supervisor (assessor) for inspection"
      },
      {
        "type": "image",
        "src": "/assets/question-15/task2.png",
        "caption": "Rodding and Roping setup"
      },
      {
        "type": "text",
        "title": "Plan of proposed work",
        "content": "MH1 to Pit 1: 0100-0140, 50/0.40 P50 2.15\nPit 1 to Pit 2: 0101-0130, 50/0.40 P50 2.10\nPit 2 to Pit 3: 0100-0120, 50/0.40 P50 2.30"
      }
    ],
    "observationItems": [
      "Assemble cable drum stand",
      "Clean silt from pit",
      "Rod conduit successfully",
      "Attach hauling line and draw through",
      "Clean conduit with brush",
      "Prove conduit with slug",
      "Flame brush and seal cable end"
    ],
    "assessorSections": [
      makePCMappingTable("Practical Assessment Task 2 - Performance Criteria Mapping", "pa2", pat2PC),
      makePEMappingTable("Practical Assessment Task 2 - Performance Evidence Mapping", "pa2", pat2PE),
      makeChecklistTable("Practical Assessment Task 2 - Checklist", "pa2", pat2CL)
    ]
  },

  "task4": {
    "title": "PRACTICAL ASSESSMENT TASK 3 – HAUL CABLE",
    "observationTitle": "PRACTICAL ASSESSMENT TASK 3",
    "observationSubtitle": "Haul Cable",
    "sections": [
      {
        "type": "text",
        "title": "Assessment Instructions",
        "content": "Complete the following activities:\n1. Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice\n2. Refer to all tool/equipment instructions/manufacturers guidelines prior to use.\n3. Refer to the completed JSA for the task\n4. Ensure gas detector is on and carried on your person\n5. Attach cable grip to cable and tape on\n6. Ensure cable guides/slippers are installed correctly\n7. Attach hauling rope to cable grip eye and tie off securely.\n8. Attach a new hauling rope to the cable grip eye\n9. Lubricate the cable\n10. Haul the cable ensuring that you do not exceed the manufacturers hauling tension\n11. Ensure sufficient cable is left in pits for jointing and cut from drum.\n12. Flame brush cable end\n13. Fit endcap and shrink to seal cable\n14. Fit cable tags to both ends of cable\n15. Coil excess cable and secure to cable supports\n16. Ensure sufficient separation from other services in pits\n17. Test the continuity of the cable\n18. Close pits\n19. Restore site and clean and return all tools and equipment to the appropriate location\n20. Complete red line mark-up of plan showing completed work\n21. Complete project sign off sheet and get customer (assessor) approval\n22. Submit your completed work to your supervisor (assessor) for inspection"
      },
      {
        "type": "image",
        "src": "/assets/question-15/task3.png",
        "caption": "Hauling operation plan"
      },
      {
        "type": "image",
        "src": "/assets/question-15/task3b.png",
        "caption": "Hauling equipment setup"
      },
      {
        "type": "text",
        "title": "Test Results",
        "content": "Record the test results for continuity and loop resistance.\nLoop resistance of 1st pair: ________ Ohms"
      }
    ],
    "observationItems": [
      "Install cable guides/slippers correctly",
      "Attach hauling rope and grip securely",
      "Lubricate cable properly",
      "Maintain correct hauling tension",
      "Allow sufficient cable for jointing",
      "Fit cable tags and seal ends",
      "Test cable continuity",
      "Restore site and complete documentation"
    ],
    "assessorSections": [
      makePCMappingTable("Practical Assessment Task 3 - Performance Criteria Mapping", "pa3", pat3PC),
      makePEMappingTable("Practical Assessment Task 3 - Performance Evidence Mapping", "pa3", pat3PE),
      makeChecklistTable("Practical Assessment Task 3 - Checklist", "pa3", pat3CL)
    ]
  },

  "taskPA5": {
    "title": "PRACTICAL ASSESSMENT TASK 5",
    "observationTitle": "PRACTICAL ASSESSMENT TASK 5",
    "observationSubtitle": "Performance Criteria & Checklist",
    "sections": [
      {
        "type": "text",
        "title": "Assessment Instructions",
        "content": "For Practical Assessment Task 5, you will be assessed on the following performance criteria, performance evidence and checklist items."
      }
    ],
    "assessorSections": [
      makePCMappingTable("Practical Assessment Task 5 - Performance Criteria Mapping (ICTCBL249)", "pa5", pat5PC),
      makePEMappingTable("Practical Assessment Task 5 - Performance Evidence Mapping (ICTCBL249)", "pa5", pat5PE),
      makeChecklistTable("Practical Assessment Task 5 - Checklist (ICTCBL249)", "pa5", pat5CL)
    ]
  },

  "task5": {
    "title": "PRACTICAL ASSESSMENT TASK 4 – INSTALL 4 NEW PITS",
    "observationTitle": "PRACTICAL ASSESSMENT TASK 4",
    "observationSubtitle": "Install 4 New Pits",
    "sections": [
      {
        "type": "text",
        "title": "Assessment Task Description",
        "content": "For this assessment, you are working as a telco technician. You have been assigned a task as part of a team by your supervisor to install 4 new pits in preparation for jointing. You will be required set up all equipment, excavate the site, shore up the excavation, install one of the pits, install the connecting conduits to the adjacent pits, install a joint support bar and reinstate the site and prove the conduit and install rope in preparation for hauling.\n\nPrior to commencing the task, you are required to assess the work site and complete a Job Safety Analysis (JSA) to capture and address hazards, unwanted events, and potential risks for the job."
      },
      {
        "type": "text",
        "title": "Resources Required",
        "content": "• Learners Guide\n• Student Assessment Pack\n• Blue or Black Pen\n• WHS/OHS Acts/Regulations as applicable to the state of delivery\n• Codes of practice\n    ◦ How to manage work health and safety risks\n    ◦ Managing the work environment and facilities\n    ◦ Managing risks of plant in the workplace\n    ◦ Managing noise preventing hearing loss work\n    ◦ Managing the risk of falls at workplaces\n• Workplace procedure 01687W01 Working at Telstra Manholes and Pits\n• JSA-Included in this assessment pack\n• Installed #6 pit\n• #6 Pits x1\n• Manhole guards*\n• Pit keys x2*\n• Gas detector*\n• Gas action chart\n• Shovel\n• Shoring boards\n• Conduit rodder\n• Hauling rope*\n• Sand scoop*\n• Conduit cleaning brush*\n• Conduits slug*\n• 50mm white UPV Conduit x 2 metres*\n• 50mm PVC Bush x 2*\n• PVC Pipe adhesive and primer*\n• Fibreglass joint support bar x 0.5metres\n• 10mm paintbrush*\n• Hole saw 66mm*\n• Hack saw*\n• Deburring tool*\n• Retro reflective vest*\n• Gloves*\n• Hard Hat*\n• Safety glasses*\n\nManufacturers specifications and operating instructions for all tools & equipment specified with a *"
      },
      {
        "type": "text",
        "title": "Assessment Instructions",
        "content": "Complete the following activities:\n1. Ensure that all tasks follow WHS/OHS requirements.\n2. Refer to tool/equipment instructions prior to use.\n3. Refer to the completed JSA.\n4. Ensure gas detector is on.\n5. Set up all equipment.\n6. Excavate the site.\n7. Shore up the excavation.\n8. Install one of the pits.\n9. Install the connecting conduits to the adjacent pits.\n10. Backfill site.\n11. Rod conduit.\n12. Attach hauling line and draw through conduit.\n13. Attach cleaning brush and clean debris.\n14. Prove conduit with appropriate slug.\n15. Leave hauling line in conduit.\n16. Install a joint support bar in the pit.\n17. Fit the pit gasket and pit lid.\n18. Submit your completed work for inspection."
      },
      {
        "type": "image",
        "src": "/assets/question-15/task4.png",
        "caption": "Pit installation plan"
      }
    ],
    "observationItems": [
      "Excavate site maintaining stability",
      "Install pit according to specifications",
      "Install conduit ensuring no sharp edges",
      "Seal conduit entry into enclosure",
      "Install joint support bar",
      "Complete backfill safely",
      "Restore site to customer satisfaction",
      "Prove conduit and install rope"
    ],
    "assessorSections": [
      makePCMappingTable("Practical Assessment Task 4 - Performance Criteria Mapping", "pa4", pat4PC),
      makePEMappingTable("Practical Assessment Task 4 - Performance Evidence Mapping", "pa4", pat4PE),
      makeChecklistTable("Practical Assessment Task 4 - Checklist", "pa4", pat4CL)
    ]
  },

  "task6": {
    "title": "PRACTICAL ASSESSMENT TASK 6 – INSTALL PREFABRICATED MANHOLE",
    "observationTitle": "PRACTICAL ASSESSMENT TASK 6",
    "observationSubtitle": "Install Prefabricated Manhole, Conduit and Pit",
    "sections": [
      {
        "type": "text",
        "content": "Your assessor will advise you of the due date of these submissions."
      },
      {
        "type": "text",
        "title": "Assessment Instructions",
        "content": "Complete the following activities:\n1. Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice.\n2. Refer to all tool/equipment instructions/manufacturers guidelines prior to use.\n3. Refer to the completed JSA for the task.\n4. Ensure gas detector is on and carried on your person.\n5. Set up all equipment.\n6. Refer to the construction plan.\n7. Mark out the excavation area using marking paint.\n8. Excavate the site.\n9. Shore up the excavation.\n10. Install an earth mat and connecting earth wire in preparation for the manhole installation.\n11. Install a foundation base for the manhole.\n12. Install the prefabricated manhole and plinth.\n13. Install the #6 pit.\n14. Install the connecting conduits to the adjacent pits.\n15. Backfill site.\n16. Rod conduit.\n17. Attach hauling line and draw through conduit.\n18. Attach cleaning brush to hauling line and clean debris from conduit.\n19. Prove conduit with appropriate size slug.\n20. Leave hauling line in conduit.\n21. Install a joint support bar in the pit.\n22. Fit the pit gasket and pit lid.\n23. Submit your completed work to your supervisor (assessor) for inspection."
      },
      {
        "type": "image",
        "src": "/assets/question-15/task6.png",
        "caption": "Plan of proposed work"
      },
      {
        "type": "text",
        "title": "Assessment Task Description",
        "content": "For this assessment, you are working as a telco technician. You have been assigned a task as part of a team by your supervisor to install a prefabricated manhole, conduit and a 6 pit in preparation for jointing. You will be required set up all equipment, excavate the site, shore up the excavation, install base material, install an earth mat, install the prefabricated manhole, install the 6 pit, install the connecting conduits from the manhole to the adjacent pit and reinstate the site and prove the conduit and install rope in preparation for hauling.\n\nPrior to commencing the task, you are required to assess the work site and complete a Job Safety Analysis (JSA) to capture and addressed hazards, unwanted events, and potential risks for the job."
      },
      {
        "type": "text",
        "title": "Resources Required",
        "content": "• Learners Guide\n• Student Assessment Pack\n• Blue or Black Pen\n• WHS/OHS Acts/Regulations as applicable to the state of delivery\n• Codes of practice\n    ◦ How to manage work health and safety risks\n    ◦ Managing the work environment and facilities\n    ◦ Managing risks of plant in the workplace\n    ◦ Managing noise preventing hearing loss work\n    ◦ Managing the risk of falls at workplaces\n    ◦ Managing electrical risks in the workplace\n• Workplace procedure 01687W01 Working at Telstra Manholes and Pits\n• JSA-Included in this assessment pack\n• Cable and Conduit Plans - Included in this assessment pack\n• 1 x Prefabricated manhole with plinth and covers\n• 1 x #6 Pits x1\n• 4 x sets of Manhole guards*\n• Pit keys x2*\n• Gas detector*\n• Gas action chart\n• Shovel\n• Shoring boards\n• Conduit rodder\n• Hauling rope*\n• Sand scoop*\n• Conduit cleaning brush*\n• Conduit slug*\n• 50mm white UPV Conduit x 2 meters*\n• 50mm PVC Bush x 2*\n• PVC Pipe adhesive and primer*\n• Fiberglass joint support bar x 0.5metres\n• 10mm paintbrush*\n• Hole saw 66mm*\n• Hack saw*\n• Deburring tool*\n• Backfill material (sand)\n• 4 leg chain\n• Excavator (optional)\n• Large Builder’s Square\n• Marking paint\n• Crane (as applicable to the type of prefabricated manhole)\n• Crushed Rock\n• Fixing adhesive\n• Formwork material\n• Manhole fittings, bearers, anchor irons and earthing systems\n• Mechanical ditching machine (optional)\n• Prefabricated concrete plinth and template\n• Ready mix concrete\n• Shoring system\n• Earthing Kit\n• Warning Signs\n• Wire Loops and associated lifting slings and shackles\n• Retro reflective vest*\n• Gloves*\n• Hard Hat*\n• Safety glasses*\n\nManufacturer’s specifications and operating instructions for all tools & equipment specifi *"
      }
    ],
    "observationItems": [
      "Mark out excavation area correctly",
      "Install earth mat and earthing system",
      "Install foundation base for manhole",
      "Install prefabricated manhole and plinth",
      "Install connecting conduits to adjacent pits",
      "Install joint support bar",
      "Complete all backfill and restoration"
    ],
    "assessorSections": [
      makePCMappingTable("Practical Assessment Task 6 - Performance Criteria Mapping", "pa6", pat6PC),
      makePEMappingTable("Practical Assessment Task 6 - Performance Evidence Mapping", "pa6", pat6PE),
      makeChecklistTable("Practical Assessment Task 6 - Checklist", "pa6", pat6CL)
    ]
  },

  "task7": {
    "title": "PRACTICAL ASSESSMENT TASK 7 – REMOVE PIT AND CONDUIT",
    "observationTitle": "PRACTICAL ASSESSMENT TASK 7",
    "observationSubtitle": "Remove Pit and Conduit",
    "sections": [
      {
        "type": "text",
        "title": "Assessment Instructions",
        "content": "Complete the following activities:\n1. Ensure WHS/OHS requirements are followed.\n2. Refer to JSA and gas detector check.\n3. Set up all equipment.\n4. Excavate the site.\n5. Remove obsolete pit and conduit.\n6. Install one of the pits (as replacement/new installation).\n7. Backfill site.\n8. Compact and restore site to ground level.\n9. Complete project sign off sheet.\n10. Submit your completed work for inspection."
      },
      {
        "type": "text",
        "title": "Project Sign-off Sheet",
        "content": "Ensure the following details are recorded upon completion:\n• Project Name, Project Manager, Customer\n• Start Date, Completion Date, Project Duration\n• Project Goal and Deliverables\n• Signatures of Project Manager and Customer"
      }
    ],
    "observationItems": [
      "Safely remove obsolete pit and conduit",
      "Install replacement pit correctly",
      "Compact and restore site to original ground level",
      "Complete project sign-off sheet with all details",
      "Recover and dispose of obsolete materials correctly"
    ],
    "assessorSections": [
      makePCMappingTable("Practical Assessment Task 7 - Performance Criteria Mapping", "pa7", pat7PC),
      makePEMappingTable("Practical Assessment Task 7 - Performance Evidence Mapping", "pa7", pat7PE),
      makeChecklistTable("Practical Assessment Task 7 – Checklist", "pa7", pat7CL)
    ]
  }
};
