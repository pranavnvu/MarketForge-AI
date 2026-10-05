with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "r") as f:
    text = f.read()

# We need to replace the broken end of the file:
broken = """                    The Reviewer agent has not analyzed the codebase yet.
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
  );
}"""

fixed = """                    The Reviewer agent has not analyzed the codebase yet.
                  </div>
                )}
              </div>
            </div>
          </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}"""

text = text.replace(broken, fixed)

with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "w") as f:
    f.write(text)

