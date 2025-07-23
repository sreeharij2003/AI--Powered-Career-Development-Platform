import fetch from 'node-fetch';

interface LightningAIRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
}

interface LightningAIResponse {
  // The actual response structure from Lightning AI
  // We'll extract missing skills from the content
  [key: string]: any;
}

interface ResumeAnalysisResult {
  missingSkills: string[];
  existingSkills: string[];
  analysisText: string;
  success: boolean;
  error?: string;
}

export class LightningAIService {
  private readonly apiUrl = 'https://8000-dep-01jzhzg6tqbt2ed81p51prcenr-d.cloudspaces.litng.ai/predict';
  private readonly bearerToken = 'af56b549-3f29-4d3c-a1b3-4de7420e62c8';

  /**
   * Analyze resume against job description to find missing skills
   */
  async analyzeResumeForMissingSkills(resumeText: string, jobDescription: string): Promise<ResumeAnalysisResult> {
    try {
      console.log('🤖 Calling Lightning AI for resume analysis...');
      
      // Prepare the request payload in the format expected by Lightning AI
      const requestPayload: LightningAIRequest = {
        messages: [
          {
            role: "user",
            content: JSON.stringify({
              job_description: jobDescription,
              resume_text: resumeText
            })
          }
        ]
      };

      console.log('📤 Sending request to Lightning AI:', {
        url: this.apiUrl,
        payload: requestPayload
      });

      // Make the API call to Lightning AI
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`Lightning AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as LightningAIResponse;
      console.log('📥 Received response from Lightning AI:', data);

      // Debug the response structure
      if (data.choices && data.choices[0]) {
        console.log('🔍 Message object:', data.choices[0].message);
        console.log('🔍 Message content type:', typeof data.choices[0].message?.content);
        console.log('🔍 Message content preview:', data.choices[0].message?.content?.substring(0, 200));
      }

      // Extract missing skills from the response
      const analysisResult = this.extractMissingSkills(data);
      
      console.log('✅ Extracted missing skills:', analysisResult.missingSkills);
      
      return analysisResult;

    } catch (error) {
      console.error('❌ Error calling Lightning AI:', error);
      
      return {
        missingSkills: [],
        existingSkills: [],
        analysisText: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extract missing skills from Lightning AI response
   * This method parses the LLM output to find the missing skills section
   */
  private extractMissingSkills(response: LightningAIResponse): ResumeAnalysisResult {
    try {
      // The response structure may vary, so we need to find the content
      let analysisText = '';

      // Common response structures to check
      if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
        console.log('🎯 Using choices[0].message.content');
        analysisText = response.choices[0].message.content;
      } else if (response.content) {
        console.log('🎯 Using response.content');
        analysisText = response.content;
      } else if (response.text) {
        console.log('🎯 Using response.text');
        analysisText = response.text;
      } else if (response.response) {
        console.log('🎯 Using response.response');
        analysisText = response.response;
      } else if (response.raw_response) {
        console.log('🎯 Using response.raw_response');
        analysisText = response.raw_response;
      } else {
        // If we can't find the content, stringify the whole response
        console.log('🎯 Using stringified response');
        analysisText = JSON.stringify(response);
      }

      console.log('🔍 Analyzing text for missing skills:', analysisText);

      // DIRECT EXTRACTION FROM FULL TEXT - NO JSON PARSING
      let missingSkills: string[] = [];
      let existingSkills: string[] = [];

      console.log('🎯 DIRECT EXTRACTION: Looking for skills in the response...');

      // DIRECT PATTERN MATCHING - Look for the escaped skills in the raw content
      // Pattern: [\\"Deep Learning\\", \\"Predictive Analytics\\", \\"Natural Language Processing\\"]

      const importantPattern = /\\"important\\":\s*\[\\"([^\\]+(?:\\",\s*\\"[^\\]+)*)\\"]/;
      const importantMatch = analysisText.match(importantPattern);

      if (importantMatch) {
        console.log('🟡 FOUND IMPORTANT SKILLS RAW:', importantMatch[1]);
        const skillsString = importantMatch[1];
        const importantSkills = skillsString
          .split('\\", \\"')
          .map(skill => skill.replace(/\\"/g, '').trim())
          .filter(skill => skill.length > 0);
        console.log('🟡 PARSED IMPORTANT SKILLS:', importantSkills);
        missingSkills.push(...importantSkills);
      } else {
        console.log('❌ No important skills pattern found');
        console.log('🔍 Searching in text:', analysisText.substring(0, 500));
      }

      // Look for critical skills in double-escaped format
      const criticalPattern = /\\"critical\\":\s*\[\\"([^\\]+(?:\\",\s*\\"[^\\]+)*)\\"]/;
      const criticalMatch = analysisText.match(criticalPattern);

      if (criticalMatch) {
        console.log('🔴 FOUND CRITICAL SKILLS RAW:', criticalMatch[1]);
        const skillsString = criticalMatch[1];
        const criticalSkills = skillsString
          .split('\\", \\"')
          .map(skill => skill.replace(/\\"/g, '').trim())
          .filter(skill => skill.length > 0 && skill !== 'Analysis incomplete');
        console.log('🔴 PARSED CRITICAL SKILLS:', criticalSkills);
        missingSkills.push(...criticalSkills);
      }

      // Look for nice_to_have skills in double-escaped format
      const niceToHavePattern = /\\"nice\\_to\\_have\\":\s*\[\\"([^\\]+(?:\\",\s*\\"[^\\]+)*)\\"]/;
      const niceToHaveMatch = analysisText.match(niceToHavePattern);

      if (niceToHaveMatch) {
        console.log('🟢 FOUND NICE_TO_HAVE SKILLS RAW:', niceToHaveMatch[1]);
        const skillsString = niceToHaveMatch[1];
        const niceToHaveSkills = skillsString
          .split('\\", \\"')
          .map(skill => skill.replace(/\\"/g, '').trim())
          .filter(skill => skill.length > 0);
        console.log('🟢 PARSED NICE_TO_HAVE SKILLS:', niceToHaveSkills);
        missingSkills.push(...niceToHaveSkills);
      }

      console.log('🎯 DIRECT EXTRACTION RESULT:', missingSkills);

      return {
        missingSkills,
        existingSkills,
        analysisText,
        success: true
      };

    } catch (error) {
      console.error('❌ Error extracting missing skills:', error);

      return {
        missingSkills: [],
        existingSkills: [],
        analysisText: '',
        success: false,
        error: 'Failed to parse Lightning AI response'
      };
    }
  }

  /**
   * Parse JSON response from Lightning AI
   */
  private parseJSONResponse(jsonText: string): { success: boolean; missingSkills: string[]; existingSkills: string[] } {
    try {
      // Clean up the JSON text - fix common issues
      let cleanedJson = jsonText
        .replace(/\\_/g, '_') // Fix escaped underscores
        .replace(/\\"/g, '"') // Fix escaped quotes
        .replace(/\\\\/g, '\\') // Fix double backslashes
        .trim();

      console.log('🧹 Cleaned JSON text:', cleanedJson);

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedJson);

        // If parsed successfully, check if it has raw_response and use that instead
        if (parsed.raw_response) {
          console.log('🔄 Found raw_response, using that for skill extraction...');
          let rawResponse = parsed.raw_response
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\_/g, '_')
            .replace(/\\\\/g, '\\');
          console.log('🔄 Parsing raw_response:', rawResponse);
          try {
            parsed = JSON.parse(rawResponse);
          } catch (rawParseError) {
            console.log('🔄 Raw response parsing failed, using text extraction...');
            // Use text extraction for incomplete raw_response
            const textSkills = this.extractSkillsFromIncompleteJSON(rawResponse);
            return {
              success: true,
              missingSkills: textSkills,
              existingSkills: []
            };
          }
        }
      } catch (parseError) {
        // If direct parsing fails, try to extract from raw_response
        console.log('🔄 Direct parsing failed, trying to extract raw_response...');
        const rawResponseMatch = cleanedJson.match(/"raw_response":\s*"([^"]+)"/);
        if (rawResponseMatch) {
          let rawResponse = rawResponseMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\_/g, '_')
            .replace(/\\\\/g, '\\');
          console.log('🔄 Trying to parse raw_response:', rawResponse);
          try {
            parsed = JSON.parse(rawResponse);
          } catch (rawParseError) {
            // Use text extraction for incomplete raw_response
            const textSkills = this.extractSkillsFromIncompleteJSON(rawResponse);
            return {
              success: true,
              missingSkills: textSkills,
              existingSkills: []
            };
          }
        } else {
          throw parseError;
        }
      }

      console.log('✅ Successfully parsed JSON:', parsed);

      const missingSkills: string[] = [];
      const existingSkills: string[] = [];

      // Extract missing skills from the parsed JSON
      if (parsed.missing_skills) {
        const missingSkillsObj = parsed.missing_skills;

        // Check if missing_skills is empty object
        if (Object.keys(missingSkillsObj).length === 0) {
          console.log('📭 Missing skills object is empty - will try to extract from recommended_projects');
        }

        // Handle different structures
        if (Array.isArray(missingSkillsObj)) {
          missingSkills.push(...missingSkillsObj);
        } else if (typeof missingSkillsObj === 'object') {
          // Handle categorized skills (critical, important, nice_to_have)
          if (missingSkillsObj.critical && Array.isArray(missingSkillsObj.critical)) {
            missingSkills.push(...missingSkillsObj.critical);
          }
          if (missingSkillsObj.important && Array.isArray(missingSkillsObj.important)) {
            missingSkills.push(...missingSkillsObj.important);
          }
          if (missingSkillsObj.nice_to_have && Array.isArray(missingSkillsObj.nice_to_have)) {
            missingSkills.push(...missingSkillsObj.nice_to_have);
          }
        }
      }

      // If missing_skills is empty, try to extract from recommended_projects
      if (missingSkills.length === 0 && parsed.recommended_projects) {
        console.log('🔍 Missing skills empty, extracting from recommended_projects...');
        const projects = parsed.recommended_projects;
        if (Array.isArray(projects)) {
          projects.forEach((project: any) => {
            if (project.skill_focus) {
              missingSkills.push(project.skill_focus);
            }
            if (project.project) {
              // Extract skills mentioned in project description
              const projectSkills = this.extractSkillsFromProjectDescription(project.project);
              missingSkills.push(...projectSkills);
            }
          });
        }
      }

      // Extract existing skills if available
      if (parsed.existing_skills) {
        const existingSkillsObj = parsed.existing_skills;
        if (Array.isArray(existingSkillsObj)) {
          existingSkills.push(...existingSkillsObj);
        } else if (typeof existingSkillsObj === 'object') {
          // Handle categorized existing skills
          Object.values(existingSkillsObj).forEach((skillArray: any) => {
            if (Array.isArray(skillArray)) {
              existingSkills.push(...skillArray);
            }
          });
        }
      }

      console.log('🎯 Extracted missing skills from JSON:', missingSkills);
      console.log('✅ Extracted existing skills from JSON:', existingSkills);

      return {
        success: true,
        missingSkills: missingSkills.filter(skill =>
          skill &&
          skill.trim().length > 0 &&
          !skill.includes('timestamp') &&
          !skill.includes('model_used') &&
          !skill.includes('07T') &&
          !skill.includes('Mistral') &&
          !skill.includes('Instruct') &&
          !skill.includes('v0.2')
        ),
        existingSkills: existingSkills.filter(skill => skill && skill.trim().length > 0)
      };

    } catch (error) {
      console.error('❌ JSON parsing failed:', error);

      // Fallback: try to extract skills from text patterns
      console.log('🔄 Falling back to text pattern extraction...');
      const textSkills = this.extractSkillsFromIncompleteJSON(jsonText);

      return {
        success: textSkills.length > 0,
        missingSkills: textSkills,
        existingSkills: []
      };
    }
  }

  /**
   * Extract skills from incomplete/malformed JSON text
   */
  private extractSkillsFromIncompleteJSON(text: string): string[] {
    const skills: string[] = [];

    console.log('🔍 Extracting skills from incomplete JSON...');

    // Pattern 1: Extract from skill_focus fields
    const skillFocusPattern = /"skill_focus":\s*"([^"]+)"/g;
    let match;
    while ((match = skillFocusPattern.exec(text)) !== null) {
      console.log('🎯 Found skill_focus:', match[1]);
      skills.push(match[1]);
    }

    // Pattern 2: Extract from project descriptions
    const projectPattern = /"project":\s*"([^"]+)"/g;
    while ((match = projectPattern.exec(text)) !== null) {
      console.log('📝 Found project description:', match[1]);
      const projectSkills = this.extractSkillsFromProjectDescription(match[1]);
      skills.push(...projectSkills);
    }

    // Pattern 3: Extract from missing_skills arrays - SIMPLIFIED PATTERNS
    console.log('🔍 Looking for critical skills...');
    const criticalPattern = /critical.*?\[([^\]]+)\]/g;
    while ((match = criticalPattern.exec(text)) !== null) {
      console.log('🔴 Found critical match:', match[1]);
      const criticalSkills = this.extractSkillsFromBrackets(match[1]);
      skills.push(...criticalSkills);
    }

    console.log('🔍 Looking for important skills...');
    const importantPattern = /important.*?\[([^\]]+)\]/g;
    while ((match = importantPattern.exec(text)) !== null) {
      console.log('🟡 Found important match:', match[1]);
      const importantSkills = this.extractSkillsFromBrackets(match[1]);
      skills.push(...importantSkills);
    }

    console.log('🔍 Looking for nice_to_have skills...');
    const niceToHavePattern = /nice.*?have.*?\[([^\]]+)\]/g;
    while ((match = niceToHavePattern.exec(text)) !== null) {
      console.log('🟢 Found nice_to_have match:', match[1]);
      const niceToHaveSkills = this.extractSkillsFromBrackets(match[1]);
      skills.push(...niceToHaveSkills);
    }

    // Remove duplicates and filter out metadata
    const uniqueSkills = [...new Set(skills)]
      .filter(skill =>
        skill &&
        skill.trim().length > 0 &&
        !skill.includes('timestamp') &&
        !skill.includes('model_used') &&
        !skill.includes('07T') &&
        !skill.includes('Mistral') &&
        !skill.includes('Instruct') &&
        !skill.includes('v0.2') &&
        skill.length < 50
      );

    console.log('🎯 Extracted skills from incomplete JSON:', uniqueSkills);
    return uniqueSkills;
  }

  /**
   * Extract skills from project description
   */
  private extractSkillsFromProjectDescription(projectDescription: string): string[] {
    const skills: string[] = [];

    // Common skill patterns in project descriptions
    const skillPatterns = [
      /using\s+([^,\s]+(?:\s+[^,\s]+)*)/gi,
      /with\s+([^,\s]+(?:\s+[^,\s]+)*)/gi,
      /and\s+([^,\s]+(?:\s+[^,\s]+)*)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, // Capitalized words
      /(Python|JavaScript|React|Node\.js|MongoDB|SQL|Machine Learning|Data Science|TypeScript|CSS|HTML|Docker|AWS|Git)/gi
    ];

    for (const pattern of skillPatterns) {
      const matches = projectDescription.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match
            .replace(/^(using|with|and)\s+/i, '')
            .trim();
          if (skill.length > 2 && skill.length < 30) {
            skills.push(skill);
          }
        });
      }
    }

    return [...new Set(skills)]; // Remove duplicates
  }

  /**
   * Parse missing skills from the analysis text using various patterns
   */
  private parseMissingSkillsFromText(text: string): string[] {
    const missingSkills: string[] = [];
    
    try {
      // Convert to lowercase for pattern matching
      const lowerText = text.toLowerCase();
      
      // Pattern 1: Look for JSON-like missing_skills structure
      const jsonLikePattern = /missing\\_skills["\s]*:[^{]*\{([^}]+)\}/gi;
      const jsonMatch = text.match(jsonLikePattern);
      if (jsonMatch) {
        for (const match of jsonMatch) {
          // Extract skills from JSON-like structure
          const criticalMatch = match.match(/critical["\s]*:\s*\[([^\]]+)\]/i);
          const importantMatch = match.match(/important["\s]*:\s*\[([^\]]+)\]/i);
          const niceToHaveMatch = match.match(/nice_to_have["\s]*:\s*\[([^\]]+)\]/i);

          if (criticalMatch) {
            const skills = this.extractSkillsFromBrackets(criticalMatch[1]);
            missingSkills.push(...skills);
          }
          if (importantMatch) {
            const skills = this.extractSkillsFromBrackets(importantMatch[1]);
            missingSkills.push(...skills);
          }
          if (niceToHaveMatch) {
            const skills = this.extractSkillsFromBrackets(niceToHaveMatch[1]);
            missingSkills.push(...skills);
          }
        }
      }

      // Pattern 2: Look for "missing skills:" or similar headers
      const missingSkillsPatterns = [
        /missing skills?[:\-\s]+(.*?)(?:\n\n|\n[a-z]|\n\*|$)/gi,
        /skills? (?:you )?(?:need|required|lacking|missing)[:\-\s]+(.*?)(?:\n\n|\n[a-z]|\n\*|$)/gi,
        /(?:skills? )?(?:gaps?|deficiencies)[:\-\s]+(.*?)(?:\n\n|\n[a-z]|\n\*|$)/gi,
        /(?:skills? )?(?:to learn|to develop|to acquire)[:\-\s]+(.*?)(?:\n\n|\n[a-z]|\n\*|$)/gi
      ];

      for (const pattern of missingSkillsPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            const skillsText = match.replace(/missing skills?[:\-\s]+/gi, '').trim();
            const extractedSkills = this.extractSkillsFromText(skillsText);
            missingSkills.push(...extractedSkills);
          }
        }
      }

      // Pattern 2: Look for bullet points or lists after missing skills headers
      const lines = text.split('\n');
      let inMissingSkillsSection = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        
        // Check if we're entering a missing skills section
        if (trimmedLine.includes('missing') && (trimmedLine.includes('skill') || trimmedLine.includes('requirement'))) {
          inMissingSkillsSection = true;
          continue;
        }
        
        // Check if we're leaving the section
        if (inMissingSkillsSection && (trimmedLine.includes('existing') || trimmedLine.includes('recommendation') || trimmedLine.includes('summary'))) {
          inMissingSkillsSection = false;
          continue;
        }
        
        // Extract skills from the current line if we're in the section
        if (inMissingSkillsSection && (line.includes('-') || line.includes('•') || line.includes('*'))) {
          const skillsFromLine = this.extractSkillsFromText(line);
          missingSkills.push(...skillsFromLine);
        }
      }

      // Remove duplicates and clean up
      const uniqueSkills = [...new Set(missingSkills)]
        .filter(skill => skill.length > 1 && skill.length < 50)
        .filter(skill => !this.isMetadataField(skill)) // Filter out metadata
        .map(skill => skill.trim());

      console.log('🎯 Parsed missing skills:', uniqueSkills);

      return uniqueSkills;

    } catch (error) {
      console.error('❌ Error parsing missing skills:', error);
      return [];
    }
  }

  /**
   * Parse existing skills from the analysis text
   */
  private parseExistingSkillsFromText(text: string): string[] {
    const existingSkills: string[] = [];
    
    try {
      // Look for existing/current skills patterns
      const existingSkillsPatterns = [
        /(?:existing|current|has|possesses) skills?[:\-\s]+(.*?)(?:\n\n|\n[a-z]|\n\*|$)/gi,
        /skills? (?:you )?(?:have|possess|already have)[:\-\s]+(.*?)(?:\n\n|\n[a-z]|\n\*|$)/gi
      ];

      for (const pattern of existingSkillsPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            const skillsText = match.replace(/(?:existing|current|has|possesses) skills?[:\-\s]+/gi, '').trim();
            const extractedSkills = this.extractSkillsFromText(skillsText);
            existingSkills.push(...extractedSkills);
          }
        }
      }

      // Remove duplicates
      const uniqueSkills = [...new Set(existingSkills)]
        .filter(skill => skill.length > 1 && skill.length < 50)
        .map(skill => skill.trim());

      return uniqueSkills;

    } catch (error) {
      console.error('❌ Error parsing existing skills:', error);
      return [];
    }
  }

  /**
   * Check if a string is a metadata field that should not be treated as a skill
   */
  private isMetadataField(text: string): boolean {
    const metadataPatterns = [
      /timestamp/i,
      /model_used/i,
      /device_used/i,
      /resume_length/i,
      /job_description_length/i,
      /match_percentage/i,
      /fit_level/i,
      /hiring_likelihood/i,
      /^\d{4}$/, // Years like "2025"
      /^\d{2}$/, // Numbers like "07"
      /^v\d+\.\d+$/i, // Version numbers like "v0.2"
      /^[0-9T:\-\.]+$/, // Timestamps
      /^"[^"]*":\s*"/, // JSON key-value patterns
      /cuda:\d+/i, // Device identifiers
      /mistral/i,
      /instruct/i
    ];

    return metadataPatterns.some(pattern => pattern.test(text.trim()));
  }

  /**
   * Extract skills from bracket notation like ["skill1", "skill2"]
   */
  private extractSkillsFromBrackets(bracketsContent: string): string[] {
    const skills: string[] = [];

    console.log('🔧 Extracting from brackets content:', bracketsContent);

    // Remove quotes and brackets, split by comma
    const parts = bracketsContent
      .replace(/["\[\]]/g, '') // Remove quotes and brackets
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0);

    console.log('🔧 Split parts:', parts);

    for (const part of parts) {
      if (part && part.length > 1 && part.length < 100) {
        console.log('🔧 Adding skill:', part);
        skills.push(part);
      }
    }

    return skills;
  }

  /**
   * Extract individual skills from a text string
   */
  private extractSkillsFromText(text: string): string[] {
    const skills: string[] = [];
    
    // Remove common prefixes and clean the text
    const cleanText = text
      .replace(/^[\-\*\•\s]+/, '') // Remove bullet points
      .replace(/^\d+\.\s*/, '') // Remove numbered lists
      .trim();

    // Split by common delimiters
    const delimiters = [',', ';', '|', '\n', '•', '*', '-'];
    let parts = [cleanText];
    
    for (const delimiter of delimiters) {
      const newParts: string[] = [];
      for (const part of parts) {
        newParts.push(...part.split(delimiter));
      }
      parts = newParts;
    }

    // Clean and filter the parts
    for (const part of parts) {
      const skill = part.trim()
        .replace(/^[\-\*\•\s]+/, '') // Remove leading symbols
        .replace(/[\-\*\•\s]+$/, '') // Remove trailing symbols
        .trim();
        
      if (skill && skill.length > 1 && skill.length < 50) {
        skills.push(skill);
      }
    }

    return skills;
  }
}

// Export singleton instance
export const lightningAIService = new LightningAIService();
